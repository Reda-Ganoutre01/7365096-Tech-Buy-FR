import {AfterViewInit, Component, ElementRef} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {CartService} from "../../services/cart.service";
import {ApiService} from "../../services/api.service";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements AfterViewInit{
  form: FormGroup;

  constructor(private router: Router, private elementRef: ElementRef, private title: Title, private cart: CartService, private api: ApiService) {
    this.title.setTitle('Confirmez votre commande - Tech & Buy');
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      zipcode: new FormControl('', [Validators.pattern(/^\d{5}$/), Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  send(): void {
    this.form.markAllAsTouched();
    console.log('Order submit clicked', { valid: this.form.valid, value: this.form.value });
    if (this.form.valid) {
      console.log('Order valid — sending to backend', this.form.value);
      const items = this.cart.getCart();
      const total = items.reduce((acc, p) => acc + ((p.price || 0) * (p.quantity || 1)), 0);
      const payload = {
        ...this.form.value,
        items,
        total
      };

      this.api.createOrder(payload).then(async res => {
        if (res.ok) {
          const body = await res.json().catch(() => null);
          console.log('Order created', body);
          this.cart.deleteCart();
          // navigate to thanks with a timestamp query param to avoid any cached route view
          this.router.navigate(['/thanks'], { queryParams: { t: Date.now() } });
        } else {
          console.error('Failed to create order', res.status, await res.text());
          alert('Impossible d\'envoyer la commande — réessayez plus tard.');
        }
      }).catch(err => {
        console.error('Network error creating order', err);
        alert('Erreur réseau — réessayez.');
      });
    } else {
      console.warn('Order form invalid — not submitted', this.form.errors);
    }
  }

  public ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#F2F7F9';
  }
}
