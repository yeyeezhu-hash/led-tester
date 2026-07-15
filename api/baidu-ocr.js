import crypto from 'crypto';

const ALLOWED_ORIGINS = ["https://led-tester.pages.dev", "***", "***"];
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Origin, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true'
};

export default async function handler(req) {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
    }
    
    try {
        const formData = await req.formData();
        const imageBase64 = formData.get('image');
        const languageType = formData.get('language_type') || 'CHN_ENG';
        const accessToken = formData.get('access_token');
        
        if (!imageBase64 || !accessToken) {
            return new Response(JSON.stringify({ error: 'Missing image or access_token' }), {
                status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
            });
        }
        
        // Proxy the OCR request to Baidu with access_token as query param
        const searchParams = new URLSearchParams();
        searchParams.append('image', imageBase64);
        searchParams.append('language_type', languageType);
        searchParams.append('access_token', accessToken);
        
        const response = await fetch("***" + searchParams.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        const contentType = response.headers.get('content-type') || 'application/json';
        const body = await response.text();
        
        return new Response(body, {
            status: response.status,
            headers: { ...CORS_HEADERS, 'Content-Type': contentType }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
    }
}

export const config = { runtime: 'edge' };
