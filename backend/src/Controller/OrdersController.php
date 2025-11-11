<?php

namespace App\Controller;

use App\Entity\Order;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class OrdersController extends AbstractController
{
    #[Route('/orders', name: 'create_order', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json(['error' => 'Invalid JSON'], Response::HTTP_BAD_REQUEST);
        }

        $required = ['name', 'address', 'city', 'zipcode', 'email', 'items'];
        foreach ($required as $f) {
            if (empty($data[$f]) && $data[$f] !== 0) {
                return $this->json(['error' => "Field $f is required"], Response::HTTP_BAD_REQUEST);
            }
        }

        $order = new Order();
        $order->setName($data['name']);
        $order->setAddress($data['address']);
        $order->setCity($data['city']);
        $order->setZipcode($data['zipcode']);
        $order->setEmail($data['email']);
        $items = is_array($data['items']) ? $data['items'] : [];
        $order->setItems($items);

        // compute total if items contain price/quantity
        $total = 0.0;
        foreach ($items as $it) {
            $price = isset($it['price']) ? (float)$it['price'] : 0.0;
            $qty = isset($it['quantity']) ? (int)$it['quantity'] : (isset($it['qty']) ? (int)$it['qty'] : 1);
            $total += $price * $qty;
        }
        if (isset($data['total'])) {
            // prefer server computed but allow client-provided if missing
            $total = max($total, (float)$data['total']);
        }
        $order->setTotal($total);

        $em->persist($order);
        $em->flush();

        return $this->json(['id' => $order->getId()], Response::HTTP_CREATED);
    }

    #[Route('/orders', name: 'list_orders', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $repo = $em->getRepository(Order::class);
        $orders = $repo->findBy([], ['id' => 'DESC'], 20);

        $data = array_map(function(Order $o) {
            return [
                'id' => $o->getId(),
                'name' => $o->getName(),
                'email' => $o->getEmail(),
                'total' => $o->getTotal(),
                'createdAt' => $o->getCreatedAt() ? $o->getCreatedAt()->format('Y-m-d H:i:s') : null,
                'items' => $o->getItems(),
            ];
        }, $orders);

        return $this->json($data, Response::HTTP_OK);
    }
}
