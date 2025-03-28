'use client';

import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";

export default function JWT () {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const userName = localStorage.setItem("userName", decoded.userName);
                console.log("Decoded Token:", userName);
                const userRole = localStorage.setItem("userRole", decoded.role);
                const userId = localStorage.setItem("userId", decoded.id);
            } catch (error) {
                console.error("Fehler beim Decodieren des Tokens:", error);
            }
        }

    return null;
}