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
        const grantType = formData.get('grant_type');
        const clientId = formData.get('client_id');
        const clientSecret = formData.get('client_secret');
        
        if (!grantType || !clientId || !clientSecret) {
            return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
                status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
            });
        }
        
        const proxyUrl = "***" + grantType + "&client_id=" + clientId + "&client_secret=" + clientSecret;
        
        const response = await fetch(proxyUrl, {
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
