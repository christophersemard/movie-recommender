"use client";
import { useState, useEffect } from "react";
import Questionnaire from "../components/Questionnaire";
import MovieSlider from "../components/MovieSlider";
import axios from "axios";
import Waiting from "../components/Waiting";

export default function Home() {
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [searching, isSearching] = useState(false);

    const handleQuestionnaireSubmit = (preferences) => {
        // Envoie des préférences à l'API sur la route /api/recommendations
        isSearching(true);
        axios.post("/api/recommendations", preferences).then((response) => {
            console.log(response.data);
            if (response.data.recommendations.length > 0) {
                // Stocker les recommandations dans le state
                setRecommendations(response.data.recommendations);
                isSearching(false);
                setShowRecommendations(true);
            }
        });
    };

    const handleReshowQuestionnaire = () => {
        setShowRecommendations(false);
    };

    useEffect(() => {}, [searching, showRecommendations, recommendations]);

    return (
        <div className="min-h-screen bg-background">
            <div className="w-full ">
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
