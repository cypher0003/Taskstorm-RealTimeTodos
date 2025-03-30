'use client';

import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";

export default function JWT () {
  const token = localStorage.getItem("token");


  useEffect(() => {
    if (!token) return; 
    else {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded Token:", decoded);
  
        localStorage.setItem("username", decoded.username);
        localStorage.setItem("profilePicture", decoded.profile_picture)
  
  
      } catch (error) {
        console.error("Fehler beim Decodieren des Tokens:", error);
      }
    }

    
  }, [token]); 


  return null; 
}
