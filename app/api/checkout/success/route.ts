import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

//購入履歴の保存
export async function POST(request: Request/*, responce: Response*/) {
    const { sessionId } = await request.json();

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // オプショナルな値のチェック
        const clientReferenceId = session.client_reference_id;
        const bookId = session.metadata?.bookId;

        if (!clientReferenceId || !bookId) {
            return NextResponse.json({ error: "Invalid session data" });
        }

        const existingPurchase = await prisma.purchase.findFirst({
            where: {
                userId: clientReferenceId,
                bookId: bookId,
            },
        });

        if (!existingPurchase) {
            const purchase = await prisma.purchase.create({
                data: {
                    userId: clientReferenceId,
                    bookId: bookId,
                },
            });
            return NextResponse.json({ purchase });
        } else {
            return NextResponse.json({ message: "すでに購入済みです。" });
        }

    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message });
        }
        return NextResponse.json({ error: "An unknown error occurred" });
    }
}
