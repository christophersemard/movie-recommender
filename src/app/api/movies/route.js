import { NextResponse } from "next/server";
import moviesData from "../movies_with_details.json"; // Si vous avez déjà récupéré les films

export async function GET(req) {
    try {
        return NextResponse.json(moviesData);
    } catch (e) {
        console.log(e);
        return NextResponse.json(
            {
                error: e,
                message:
                    "Une erreur est survenue, veuillez réessayer plus tard.",
            },
            { status: 500 }
        );
    }
}
