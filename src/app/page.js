"use client";
import { useState } from "react";
import Questionnaire from "../components/Questionnaire";
import MovieSlider from "../components/MovieSlider";
import Waiting from "../components/Waiting";

export default function Home() {
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [searching, isSearching] = useState(false);
    const [error, setError] = useState("");

    const handleQuestionnaireSubmit = (preferences) => {
        // Envoie des préférences à l'API sur la route /api/recommendations
        setError("");
        isSearching(true);
        fetch("/api/recommendations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(preferences),
        })
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error);
                }

                if (data.recommendations.length > 0) {
                    setRecommendations(data.recommendations);
                    setShowRecommendations(true);
                } else {
                    setError("Aucune recommandation trouvée.");
                }
            })
            .catch(() =>
                setError("Impossible de générer les recommandations.")
            )
            .finally(() => isSearching(false));
    };

    const handleReshowQuestionnaire = () => {
        setShowRecommendations(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="w-full ">
                {error && (
                    <p className="relative z-20 bg-red-950 p-4 text-center text-white">
                        {error}
                    </p>
                )}
                {!showRecommendations ? (
                    !searching ? (
                        <Questionnaire onSubmit={handleQuestionnaireSubmit} />
                    ) : (
                        <Waiting />
                    )
                ) : (
                    <MovieSlider
                        movies={recommendations}
                        setMovies={setRecommendations}
                        handleReshowQuestionnaire={handleReshowQuestionnaire}
                    />
                )}
            </div>
        </div>
    );
}
