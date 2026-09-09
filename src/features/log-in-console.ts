export function create_log_in_console(filename: string) {
    return (log: string) => {
        console.log(`[${filename}] ${log}`);
    };
}

export function log_in_console(log: string, filename: string) {
    console.log(`[${filename}] ${log}`);
}