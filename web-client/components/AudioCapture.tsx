import React, { useState, useRef } from 'react';
import { createClient } from '../utils/supabase/client';

const AudioCapture = ({ chefId, onAnalysisComplete }: { chefId: string, onAnalysisComplete: (data: any) => void }) => {
    const supabase = createClient();
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                chunksRef.current = [];
                await uploadAudio(blob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop all tracks to release microphone
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const uploadAudio = async (blob: Blob) => {
        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', blob, 'recording.webm');
        formData.append('chef_id', chefId);

        try {
            // Invoke Supabase Edge Function
            const { data, error } = await supabase.functions.invoke('analyze-audio', {
                body: formData,
            });

            if (error) throw error;

            onAnalysisComplete(data);
        } catch (error) {
            console.error("Error uploading audio:", error);
            alert("Failed to analyze audio.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <h3 className="text-xl font-bold text-amber-500 mb-4">Modo Cocina</h3>

            <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'}`}>
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                    className="w-full h-full flex items-center justify-center focus:outline-none"
                >
                    {isProcessing ? (
                        <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : isRecording ? (
                        <div className="w-8 h-8 bg-white rounded-sm" /> // Stop Icon
                    ) : (
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg> // Mic Icon
                    )}
                </button>
            </div>

            <p className="mt-4 text-gray-300 text-sm">
                {isRecording ? "Listening to your kitchen..." : isProcessing ? "Analyzing Chef DNA..." : "Tap to transcribe your soul"}
            </p>
        </div>
    );
};

export default AudioCapture;
