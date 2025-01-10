// components/Waiting.js
import React from "react";

const Waiting = () => {
    return (
        <div
            className="relative w-full h-screen text-textPrimary  p-20 px-24
 bg-cover bg-center shadow-lg"
            style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/w500/1pnigkWWy8W032o9TKDneBa3eVK.jpg)`,
            }}
        >
            <div className="absolute inset-0 bg-black opacity-70"></div>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="flex flex-col items-center justify-center space-y-4">
                    {/* Spinner */}
                    <div className="w-32 h-32">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 200 200"
                        >
                            <rect
                                fill="#FFB84D"
                                stroke="#FFB84D"
                                stroke-width="15"
                                width="30"
                                height="30"
                                x="25"
                                y="50"
                            >
                                <animate
                                    attributeName="y"
                                    calcMode="spline"
                                    dur="2"
                                    values="50;120;50;"
                                    keySplines=".5 0 .5 1;.5 0 .5 1"
                                    repeatCount="indefinite"
                                    begin="-.4"
                                ></animate>
                            </rect>
                            <rect
                                fill="#FFB84D"
                                stroke="#FFB84D"
                                stroke-width="15"
                                width="30"
                                height="30"
                                x="85"
                                y="50"
                            >
                                <animate
                                    attributeName="y"
                                    calcMode="spline"
                                    dur="2"
                                    values="50;120;50;"
                                    keySplines=".5 0 .5 1;.5 0 .5 1"
                                    repeatCount="indefinite"
                                    begin="-.2"
                                ></animate>
                            </rect>
                            <rect
                                fill="#FFB84D"
                                stroke="#FFB84D"
                                stroke-width="15"
                                width="30"
                                height="30"
                                x="145"
                                y="50"
                            >
                                <animate
                                    attributeName="y"
                                    calcMode="spline"
                                    dur="2"
                                    values="50;120;50;"
                                    keySplines=".5 0 .5 1;.5 0 .5 1"
                                    repeatCount="indefinite"
                                    begin="0"
                                ></animate>
                            </rect>
                        </svg>
                    </div>
                    {/* Message */}
                    <p className="text-textPrimary text-xl text-center font-sans">
                        Veuillez patienter quelques secondes <br></br> pendant
                        qu&apos;on cherche des films pour vous
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Waiting;
