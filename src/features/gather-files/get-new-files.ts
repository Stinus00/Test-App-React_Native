import { File, Paths } from 'expo-file-system';
import { create_log_in_console } from '../log-in-console';

const log_in_console = create_log_in_console('get-new-files');

const url = 'https://www.w3schools.com/html/mov_bbb.mp4';

export async function test() {
    console.log('[get-new-files] Native download started', url);

    try {
        const destination = new File(Paths.cache, 'mov_bbb.mp4');

        log_in_console(`Cache directory: ${Paths.cache.uri}`);
        log_in_console(`File exists: ${destination.exists}`);
        log_in_console(`File size: ${destination.size}`);
        log_in_console(`File URI: ${destination.uri}`);

        const src = await File.downloadFileAsync(url, destination, {
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
    console.log('[get-new-files] Web download started', url);

    // Browsers can play this public URL directly; fetching it as a blob may be blocked by CORS.
    return url;
}
