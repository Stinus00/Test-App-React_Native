import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { create_log_in_console } from '../log-in-console';

const log_in_console = create_log_in_console('get-new-files');

const mediaDir = Platform.OS === 'web' ? null : new Directory(Paths.document, 'media');

if (mediaDir) {
    mediaDir.create({
        idempotent: true,
        intermediates: true
    });
}

const url = 'https://www.w3schools.com/html/mov_bbb.mp4';

export function getMediaUri(_url: string) {
    if (Platform.OS === 'web') {
        return _url;
    }

    const destination = getFileDestination(_url)

    return destination.uri
}

function getType(matchType:string|undefined) {
    switch (matchType) {
        case 'images': return '.jpg';
        case 'videos': return '.mp4';
        default: throw new Error('No Type');
    }
}
function getFileDestination(_url:string) {
    if (Platform.OS === 'web' || !mediaDir) {
        throw new Error('Native file downloads are not available on web.');
    }

    const regexExp = /(?<=images\/|videos\/)[^./]+/
    const match = regexExp.exec(_url);
    const name = match?.[0];

    log_in_console(`File name: ${name}`)

    const regexType = /(images|videos)/
    const matchType = regexType.exec(_url);
    const type = getType(matchType?.[0]);

    const destination = new File(mediaDir, `${name}${type}`);

    return destination
}
export async function downloadFile(_url: string) {
    if (Platform.OS === 'web') {
        console.log('Web thingy');
        return _url;
    }

    log_in_console(`Native download started ${_url}`);
    const destination = getFileDestination(_url);
    
    try {
        log_in_console(`Cache directory: ${Paths.cache.uri}`);
        log_in_console(`File exists: ${destination.exists}`);
        log_in_console(`File size: ${destination.size}`);
        log_in_console(`File URI: ${destination.uri}`);

        if(destination.exists) {
            log_in_console("File with name already exists.")
            return destination.uri;
            // throw new Error('File with name already exists.')
        }

        const src = await File.downloadFileAsync(_url, destination, {
            idempotent: true,
            headers: {
                'User-Agent': 'Mozilla/5.0',
            },
        });

        log_in_console(`Downloaded: ${src.exists}`);
        log_in_console(`Size: ${src.size}`);
        log_in_console(`URI: ${src.uri}`);
        return src.uri;
    } catch (error) {
        console.error('[get-new-files] Native download failed', error);
        throw error;
    }
}

export async function testWeb() {
    log_in_console(`Web download started ${url}`);

    // Browsers can play this public URL directly; fetching it as a blob may be blocked by CORS.
    return url;
}
