import { Risk } from '../types';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const API_KEY = process.env.API_KEY;

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const FOLDER_ID = '1r27xnpm-hM6TrYxVS2blTIaDIkIb-Wb4';

let gapi: any;

export const loadGapi = (): Promise<void> => {
    return new Promise((resolve) => {
        // FIX: Cast the script element to HTMLScriptElement to access the onload property.
        const script = document.querySelector<HTMLScriptElement>('script[src="https://apis.google.com/js/api.js"]');
        if (!script) { // Should not happen as it's in index.html
             console.error("Google API Script not found");
             return;
        }
        script.onload = () => {
            gapi = (window as any).gapi;
            gapi.load('client:auth2', resolve);
        };
    });
};

export const initClient = (updateSigninStatus: (isSignedIn: boolean) => void): Promise<void> => {
    return gapi.client.init({
        apiKey: API_KEY,
        clientId: GOOGLE_CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
    }).then(() => {
        const authInstance = gapi.auth2.getAuthInstance();
        authInstance.isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(authInstance.isSignedIn.get());
    });
};

export const handleAuthClick = () => {
    gapi.auth2.getAuthInstance().signIn();
};

export const handleSignoutClick = () => {
    gapi.auth2.getAuthInstance().signOut();
};

export const uploadProtocolToDrive = async (protocol: Risk): Promise<any> => {
    const protocolText = `
*** PROTOCOLO DE RISCO ***

NÍVEL: ${protocol.level}
CATEGORIA: ${protocol.category}

RELATO ORIGINAL:
"${protocol.informalReport}"

DESCRIÇÃO TÉCNICA:
${protocol.technicalDescription}

AÇÕES IMEDIATAS:
${protocol.immediateActions.map((action, index) => `${index + 1}. ${action}`).join('\n')}

SETOR RESPONSÁVEL:
${protocol.responsibleSector}

PLANO DE COMUNICAÇÃO:
${protocol.communicationPlan}

MEDIDAS PREVENTIVAS:
${protocol.preventiveMeasures.map(measure => `- ${measure}`).join('\n')}
    `.trim();

    const fileName = `Protocolo_${protocol.category.replace(/[^a-zA-Z0-9]/g, '-')}_${protocol.id}.txt`;
    const fileContent = new Blob([protocolText], { type: 'text/plain' });

    const metadata = {
        name: fileName,
        mimeType: 'text/plain',
        parents: [FOLDER_ID],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', fileContent);

    const res = await gapi.client.request({
        path: 'https://www.googleapis.com/upload/drive/v3/files',
        method: 'POST',
        params: { uploadType: 'multipart' },
        body: form,
    });
    
    return res.result;
};
