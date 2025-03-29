// 'use client';

// import { jwtDecode } from "jwt-decode";
// import { useState, useEffect } from "react";

// export default function JWT () {
//         const token = localStorage.getItem("token");
//         const [userName, setUserName] = useState('')
//         useEffect (() => {
//             if (token) {
//                 try {
//                     const decoded = jwtDecode(token);
//                     setUserName(decoded.username);
//                     console.log("Decoded Username:", userName);
    
//                 } catch (error) {
//                     console.error("Fehler beim Decodieren des Tokens:", error);
//                 }
//             }
//         })
       

//     return null;
// }