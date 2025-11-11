import {AfterViewInit, Component, ElementRef} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {Router} from "@angular/router";

@Component({
  selector: 'app-thanks',
  templateUrl: './thanks.component.html',
  styleUrls: ['./thanks.component.scss']
})
export class ThanksComponent implements AfterViewInit {

  constructor(private title: Title, private elementRef: ElementRef, private router: Router) {
    this.title.setTitle('Merci — Commande enregistrée - Tech & Buy');
  }

  public ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#F2F7F9';
    // Redirect to home after a short delay so the user sees the confirmation
    setTimeout(() => this.router.navigate(['/']), 4000);
  }

}
