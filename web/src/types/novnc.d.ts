declare module "@novnc/novnc/lib/rfb" {
    export default class RFB {
        constructor(target: HTMLElement, url: string, options?: any);
        viewOnly: boolean;
        scaleViewport: boolean;
        resizeSession: boolean;
        addEventListener(event: string, callback: (e: any) => void): void;
        disconnect(): void;
        focus(): void;
    }
}
