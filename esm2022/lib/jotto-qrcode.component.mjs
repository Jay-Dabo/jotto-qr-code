import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild, } from "@angular/core";
import { toCanvas, toDataURL, toString, } from "qrcode";
import * as i0 from "@angular/core";
import * as i1 from "@angular/platform-browser";
class QRCodeComponent {
    constructor(renderer, sanitizer) {
        this.renderer = renderer;
        this.sanitizer = sanitizer;
        this.allowEmptyString = false;
        this.colorDark = "#000000ff";
        this.colorLight = "#ffffffff";
        this.cssClass = "qrcode";
        this.elementType = "canvas";
        this.errorCorrectionLevel = "M";
        this.margin = 4;
        this.qrdata = "";
        this.scale = 4;
        this.width = 10;
        this.qrCodeURL = new EventEmitter();
        this.context = null;
    }
    async ngOnChanges() {
        await this.createQRCode();
    }
    isValidQrCodeText(data) {
        if (this.allowEmptyString === false) {
            return !(typeof data === "undefined" ||
                data === "" ||
                data === "null" ||
                data === null);
        }
        return !(typeof data === "undefined");
    }
    toDataURL(qrCodeConfig) {
        return new Promise((resolve, reject) => {
            toDataURL(this.qrdata, qrCodeConfig, (err, url) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(url);
                }
            });
        });
    }
    toCanvas(canvas, qrCodeConfig) {
        return new Promise((resolve, reject) => {
            toCanvas(canvas, this.qrdata, qrCodeConfig, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve("success");
                }
            });
        });
    }
    toSVG(qrCodeConfig) {
        return new Promise((resolve, reject) => {
            toString(this.qrdata, qrCodeConfig, (err, url) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(url);
                }
            });
        });
    }
    renderElement(element) {
        for (const node of this.qrcElement.nativeElement.childNodes) {
            this.renderer.removeChild(this.qrcElement.nativeElement, node);
        }
        this.renderer.appendChild(this.qrcElement.nativeElement, element);
    }
    async createQRCode() {
        if (this.version && this.version > 40) {
            console.warn("[jotto-qrcode] max value for `version` is 40");
            this.version = 40;
        }
        else if (this.version && this.version < 1) {
            console.warn("[jotto-qrcode]`min value for `version` is 1");
            this.version = 1;
        }
        else if (this.version !== undefined && isNaN(this.version)) {
            console.warn("[jotto-qrcode] version should be a number, defaulting to auto.");
            this.version = undefined;
        }
        try {
            if (!this.isValidQrCodeText(this.qrdata)) {
                throw new Error("[jotto-qrcode] Field `qrdata` is empty, set 'allowEmptyString=\"true\"' to overwrite this behaviour.");
            }
            if (this.isValidQrCodeText(this.qrdata) && this.qrdata === "") {
                this.qrdata = " ";
            }
            const config = {
                color: {
                    dark: this.colorDark,
                    light: this.colorLight,
                },
                errorCorrectionLevel: this.errorCorrectionLevel,
                margin: this.margin,
                scale: this.scale,
                version: this.version,
                width: this.width,
            };
            const centerImageSrc = this.imageSrc;
            const centerImageHeight = this.imageHeight || 40;
            const centerImageWidth = this.imageWidth || 40;
            const centerImageRadius = this.imageRadius || '50%';
            switch (this.elementType) {
                case "canvas": {
                    const canvasElement = this.renderer.createElement("canvas");
                    this.context = canvasElement.getContext("2d");
                    this.toCanvas(canvasElement, config)
                        .then(() => {
                        if (this.ariaLabel) {
                            this.renderer.setAttribute(canvasElement, "aria-label", `${this.ariaLabel}`);
                        }
                        if (this.title) {
                            this.renderer.setAttribute(canvasElement, "title", `${this.title}`);
                        }
                        if (centerImageSrc && this.context) {
                            this.centerImage = new Image(centerImageWidth, centerImageHeight, centerImageRadius);
                            if (centerImageSrc !== this.centerImage.src) {
                                this.centerImage.src = centerImageSrc;
                            }
                            if (centerImageHeight !== this.centerImage.height) {
                                this.centerImage.height = centerImageHeight;
                            }
                            if (centerImageWidth !== this.centerImage.width) {
                                this.centerImage.width = centerImageWidth;
                            }
                            if (centerImageRadius !== this.centerImage.radius) {
                                this.centerImage.radius = centerImageRadius;
                            }
                            const centerImage = this.centerImage;
                            if (centerImage) {
                                centerImage.onload = () => {
                                    this.context?.drawImage(centerImage, canvasElement.width / 2 - centerImageWidth / 2, canvasElement.height / 2 - centerImageHeight / 2, (parseInt(canvasElement.radius) / 2 - parseInt(centerImageRadius) / 2).toString(), centerImageWidth, centerImageHeight, centerImageRadius);
                                };
                            }
                        }
                        this.renderElement(canvasElement);
                        this.emitQRCodeURL(canvasElement);
                    })
                        .catch((e) => {
                        console.error("[jotto-qrcode] canvas error:", e);
                    });
                    break;
                }
                case "svg": {
                    const svgParentElement = this.renderer.createElement("div");
                    this.toSVG(config)
                        .then((svgString) => {
                        this.renderer.setProperty(svgParentElement, "innerHTML", svgString);
                        const svgElement = svgParentElement.firstChild;
                        this.renderer.setAttribute(svgElement, "height", `${this.width}`);
                        this.renderer.setAttribute(svgElement, "width", `${this.width}`);
                        this.renderElement(svgElement);
                        this.emitQRCodeURL(svgElement);
                    })
                        .catch((e) => {
                        console.error("[jotto-qrcode] svg error:", e);
                    });
                    break;
                }
                case "url":
                case "img":
                default: {
                    const imgElement = this.renderer.createElement("img");
                    this.toDataURL(config)
                        .then((dataUrl) => {
                        if (this.alt) {
                            imgElement.setAttribute("alt", this.alt);
                        }
                        if (this.ariaLabel) {
                            imgElement.setAttribute("aria-label", this.ariaLabel);
                        }
                        imgElement.setAttribute("src", dataUrl);
                        if (this.title) {
                            imgElement.setAttribute("title", this.title);
                        }
                        this.renderElement(imgElement);
                        this.emitQRCodeURL(imgElement);
                    })
                        .catch((e) => {
                        console.error("[jotto-qrcode] img/url error:", e);
                    });
                }
            }
        }
        catch (e) {
            console.error("[jotto-qrcode] Error generating QR Code:", e.message);
        }
    }
    emitQRCodeURL(element) {
        const className = element.constructor.name;
        if (className === SVGSVGElement.name) {
            const svgHTML = element.outerHTML;
            const blob = new Blob([svgHTML], { type: "image/svg+xml" });
            const urlSvg = URL.createObjectURL(blob);
            const urlSanitized = this.sanitizer.bypassSecurityTrustUrl(urlSvg);
            this.qrCodeURL.emit(urlSanitized);
            return;
        }
        let urlImage = "";
        if (className === HTMLCanvasElement.name) {
            urlImage = element.toDataURL("image/png");
        }
        if (className === HTMLImageElement.name) {
            urlImage = element.src;
        }
        fetch(urlImage)
            .then((urlResponse) => urlResponse.blob())
            .then((blob) => URL.createObjectURL(blob))
            .then((url) => this.sanitizer.bypassSecurityTrustUrl(url))
            .then((urlSanitized) => {
            this.qrCodeURL.emit(urlSanitized);
        })
            .catch((error) => {
            console.error("[jotto-qrcode] Error when fetching image/png URL: " + error);
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: QRCodeComponent, deps: [{ token: i0.Renderer2 }, { token: i1.DomSanitizer }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.0.0", type: QRCodeComponent, selector: "qrcode", inputs: { allowEmptyString: "allowEmptyString", colorDark: "colorDark", colorLight: "colorLight", cssClass: "cssClass", elementType: "elementType", errorCorrectionLevel: "errorCorrectionLevel", imageSrc: "imageSrc", imageHeight: "imageHeight", imageWidth: "imageWidth", imageRadius: "imageRadius", margin: "margin", qrdata: "qrdata", scale: "scale", version: "version", width: "width", alt: "alt", ariaLabel: "ariaLabel", title: "title" }, outputs: { qrCodeURL: "qrCodeURL" }, viewQueries: [{ propertyName: "qrcElement", first: true, predicate: ["qrcElement"], descendants: true, static: true }], usesOnChanges: true, ngImport: i0, template: `<div #qrcElement [class]="cssClass"></div>`, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
export { QRCodeComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: QRCodeComponent, decorators: [{
            type: Component,
            args: [{
                    selector: "qrcode",
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `<div #qrcElement [class]="cssClass"></div>`,
                }]
        }], ctorParameters: function () { return [{ type: i0.Renderer2 }, { type: i1.DomSanitizer }]; }, propDecorators: { allowEmptyString: [{
                type: Input
            }], colorDark: [{
                type: Input
            }], colorLight: [{
                type: Input
            }], cssClass: [{
                type: Input
            }], elementType: [{
                type: Input
            }], errorCorrectionLevel: [{
                type: Input
            }], imageSrc: [{
                type: Input
            }], imageHeight: [{
                type: Input
            }], imageWidth: [{
                type: Input
            }], imageRadius: [{
                type: Input
            }], margin: [{
                type: Input
            }], qrdata: [{
                type: Input
            }], scale: [{
                type: Input
            }], version: [{
                type: Input
            }], width: [{
                type: Input
            }], alt: [{
                type: Input
            }], ariaLabel: [{
                type: Input
            }], title: [{
                type: Input
            }], qrCodeURL: [{
                type: Output
            }], qrcElement: [{
                type: ViewChild,
                args: ["qrcElement", { static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcngtcXJjb2RlLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXJ4LXFyY29kZS9zcmMvbGliL2FuZ3VsYXJ4LXFyY29kZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixTQUFTLEVBRVQsWUFBWSxFQUNaLEtBQUssRUFFTCxNQUFNLEVBRU4sU0FBUyxHQUNWLE1BQU0sZUFBZSxDQUFBO0FBRXRCLE9BQU8sRUFLTCxRQUFRLEVBQ1IsU0FBUyxFQUNULFFBQVEsR0FDVCxNQUFNLFFBQVEsQ0FBQTs7O0FBR2YsTUFLYSxlQUFlO0lBNkIxQixZQUFvQixRQUFtQixFQUFVLFNBQXVCO1FBQXBELGFBQVEsR0FBUixRQUFRLENBQVc7UUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFjO1FBNUJ4RCxxQkFBZ0IsR0FBRyxLQUFLLENBQUE7UUFDeEIsY0FBUyxHQUFHLFdBQVcsQ0FBQTtRQUN2QixlQUFVLEdBQUcsV0FBVyxDQUFBO1FBQ3hCLGFBQVEsR0FBRyxRQUFRLENBQUE7UUFDbkIsZ0JBQVcsR0FBc0IsUUFBUSxDQUFBO1FBRWxELHlCQUFvQixHQUErQixHQUFHLENBQUE7UUFJN0MsV0FBTSxHQUFHLENBQUMsQ0FBQTtRQUNWLFdBQU0sR0FBRyxFQUFFLENBQUE7UUFDWCxVQUFLLEdBQUcsQ0FBQyxDQUFBO1FBRVQsVUFBSyxHQUFHLEVBQUUsQ0FBQTtRQU9oQixjQUFTLEdBQUcsSUFBSSxZQUFZLEVBQVcsQ0FBQTtRQUkxQyxZQUFPLEdBQW9DLElBQUksQ0FBQTtJQUdxQixDQUFDO0lBRXJFLEtBQUssQ0FBQyxXQUFXO1FBQ3RCLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO0lBQzNCLENBQUM7SUFFUyxpQkFBaUIsQ0FBQyxJQUFtQjtRQUM3QyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxLQUFLLEVB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QkFDVSxPQUFPO3NCQUF0QixLQUFLO2dCQUNVLEtBQUs7c0JBQXBCLEtBQUs7Z0JBR1UsR0FBRztzQkFBbEIsS0FBSztnQkFDVSxTQUFTO3NCQUF4QixLQUFLO2dCQUNVLEtBQUs7c0JBQXBCLEtBQUs7Z0JBRUksU0FBUztzQkFBbEIsTUFBTTtnQkFFMkMsVUFBVTtzQkFBM0QsU0FBUzt1QkFBQyxZQUFZLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbXBvbmVudCxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPdXRwdXQsXG4gIFJlbmRlcmVyMixcbiAgVmlld0NoaWxkLFxufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiXG5pbXBvcnQgeyBEb21TYW5pdGl6ZXIsIFNhZmVVcmwgfSBmcm9tIFwiQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3NlclwiXG5pbXBvcnQge1xuICBRUkNvZGVFcnJvckNvcnJlY3Rpb25MZXZlbCxcbiAgUVJDb2RlUmVuZGVyZXJzT3B0aW9ucyxcbiAgUVJDb2RlVG9EYXRhVVJMT3B0aW9ucyxcbiAgUVJDb2RlVG9TdHJpbmdPcHRpb25zLFxuICB0b0NhbnZhcyxcbiAgdG9EYXRhVVJMLFxuICB0b1N0cmluZyxcbn0gZnJvbSBcInFyY29kZVwiXG5pbXBvcnQgeyBRUkNvZGVWZXJzaW9uLCBRUkNvZGVFbGVtZW50VHlwZSwgRml4TWVMYXRlciB9IGZyb20gXCIuL3R5cGVzXCJcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiBcInFyY29kZVwiLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgdGVtcGxhdGU6IGA8ZGl2ICNxcmNFbGVtZW50IFtjbGFzc109XCJjc3NDbGFzc1wiPjwvZGl2PmAsXG59KVxuZXhwb3J0IGNsYXNzIFFSQ29kZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIEBJbnB1dCgpIHB1YmxpYyBhbGxvd0VtcHR5U3RyaW5nID0gZmFsc2VcbiAgQElucHV0KCkgcHVibGljIGNvbG9yRGFyayA9IFwiIzAwMDAwMGZmXCJcbiAgQElucHV0KCkgcHVibGljIGNvbG9yTGlnaHQgPSBcIiNmZmZmZmZmZlwiXG4gIEBJbnB1dCgpIHB1YmxpYyBjc3NDbGFzcyA9IFwicXJjb2RlXCJcbiAgQElucHV0KCkgcHVibGljIGVsZW1lbnRUeXBlOiBRUkNvZGVFbGVtZW50VHlwZSA9IFwiY2FudmFzXCJcbiAgQElucHV0KClcbiAgcHVibGljIGVycm9yQ29ycmVjdGlvbkxldmVsOiBRUkNvZGVFcnJvckNvcnJlY3Rpb25MZXZlbCA9IFwiTVwiXG4gIEBJbnB1dCgpIHB1YmxpYyBpbWFnZVNyYz86IHN0cmluZ1xuICBASW5wdXQoKSBwdWJsaWMgaW1hZ2VIZWlnaHQ/OiBudW1iZXJcbiAgQElucHV0KCkgcHVibGljIGltYWdlV2lkdGg/OiBudW1iZXJcbiAgQElucHV0KCkgcHVibGljIG1hcmdpbiA9IDRcbiAgQElucHV0KCkgcHVibGljIHFyZGF0YSA9IFwiXCJcbiAgQElucHV0KCkgcHVibGljIHNjYWxlID0gNFxuICBASW5wdXQoKSBwdWJsaWMgdmVyc2lvbj86IFFSQ29kZVZlcnNpb25cbiAgQElucHV0KCkgcHVibGljIHdpZHRoID0gMTBcblxuICAvLyBBY2Nlc3NpYmlsaXR5IGZlYXR1cmVzIGludHJvZHVjZWQgaW4gMTMuMC40K1xuICBASW5wdXQoKSBwdWJsaWMgYWx0Pzogc3RyaW5nXG4gIEBJbnB1dCgpIHB1YmxpYyBhcmlhTGFiZWw/OiBzdHJpbmdcbiAgQElucHV0KCkgcHVibGljIHRpdGxlPzogc3RyaW5nXG5cbiAgQE91dHB1dCgpIHFyQ29kZVVSTCA9IG5ldyBFdmVudEVtaXR0ZXI8U2FmZVVybD4oKVxuXG4gIEBWaWV3Q2hpbGQoXCJxcmNFbGVtZW50XCIsIHsgc3RhdGljOiB0cnVlIH0pIHB1YmxpYyBxcmNFbGVtZW50ITogRWxlbWVudFJlZlxuXG4gIHB1YmxpYyBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgfCBudWxsID0gbnVsbFxuICBwcml2YXRlIGNlbnRlckltYWdlPzogSFRNTEltYWdlRWxlbWVudFxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyMiwgcHJpdmF0ZSBzYW5pdGl6ZXI6IERvbVNhbml0aXplcikge31cblxuICBwdWJsaWMgYXN5bmMgbmdPbkNoYW5nZXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5jcmVhdGVRUkNvZGUoKVxuICB9XG5cbiAgcHJvdGVjdGVkIGlzVmFsaWRRckNvZGVUZXh0KGRhdGE6IHN0cmluZyB8IG51bGwpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5hbGxvd0VtcHR5U3RyaW5nID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuICEoXG4gICAgICAgIHR5cGVvZiBkYXRhID09PSBcInVuZGVmaW5lZFwiIHx8XG4gICAgICAgIGRhdGEgPT09IFwiXCIgfHxcbiAgICAgICAgZGF0YSA9PT0gXCJudWxsXCIgfHxcbiAgICAgICAgZGF0YSA9PT0gbnVsbFxuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gISh0eXBlb2YgZGF0YSA9PT0gXCJ1bmRlZmluZWRcIilcbiAgfVxuXG4gIHByaXZhdGUgdG9EYXRhVVJMKHFyQ29kZUNvbmZpZzogUVJDb2RlVG9EYXRhVVJMT3B0aW9ucyk6IFByb21pc2U8Rml4TWVMYXRlcj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShcbiAgICAgIChcbiAgICAgICAgcmVzb2x2ZTogKGFyZzogRml4TWVMYXRlcikgPT4gRml4TWVMYXRlcixcbiAgICAgICAgcmVqZWN0OiAoYXJnOiBGaXhNZUxhdGVyKSA9PiBGaXhNZUxhdGVyXG4gICAgICApID0+IHtcbiAgICAgICAgdG9EYXRhVVJMKFxuICAgICAgICAgIHRoaXMucXJkYXRhLFxuICAgICAgICAgIHFyQ29kZUNvbmZpZyxcbiAgICAgICAgICAoZXJyOiBFcnJvciB8IG51bGwgfCB1bmRlZmluZWQsIHVybDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXNvbHZlKHVybClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIH1cbiAgICApXG4gIH1cblxuICBwcml2YXRlIHRvQ2FudmFzKFxuICAgIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXG4gICAgcXJDb2RlQ29uZmlnOiBRUkNvZGVSZW5kZXJlcnNPcHRpb25zXG4gICk6IFByb21pc2U8Rml4TWVMYXRlcj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShcbiAgICAgIChcbiAgICAgICAgcmVzb2x2ZTogKGFyZzogRml4TWVMYXRlcikgPT4gRml4TWVMYXRlcixcbiAgICAgICAgcmVqZWN0OiAoYXJnOiBGaXhNZUxhdGVyKSA9PiBGaXhNZUxhdGVyXG4gICAgICApID0+IHtcbiAgICAgICAgdG9DYW52YXMoXG4gICAgICAgICAgY2FudmFzLFxuICAgICAgICAgIHRoaXMucXJkYXRhLFxuICAgICAgICAgIHFyQ29kZUNvbmZpZyxcbiAgICAgICAgICAoZXJyb3I6IEVycm9yIHwgbnVsbCB8IHVuZGVmaW5lZCkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgIHJlamVjdChlcnJvcilcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlc29sdmUoXCJzdWNjZXNzXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgICB9XG4gICAgKVxuICB9XG5cbiAgcHJpdmF0ZSB0b1NWRyhxckNvZGVDb25maWc6IFFSQ29kZVRvU3RyaW5nT3B0aW9ucyk6IFByb21pc2U8Rml4TWVMYXRlcj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShcbiAgICAgIChcbiAgICAgICAgcmVzb2x2ZTogKGFyZzogRml4TWVMYXRlcikgPT4gRml4TWVMYXRlcixcbiAgICAgICAgcmVqZWN0OiAoYXJnOiBGaXhNZUxhdGVyKSA9PiBGaXhNZUxhdGVyXG4gICAgICApID0+IHtcbiAgICAgICAgdG9TdHJpbmcoXG4gICAgICAgICAgdGhpcy5xcmRhdGEsXG4gICAgICAgICAgcXJDb2RlQ29uZmlnLFxuICAgICAgICAgIChlcnI6IEVycm9yIHwgbnVsbCB8IHVuZGVmaW5lZCwgdXJsOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgcmVqZWN0KGVycilcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlc29sdmUodXJsKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgfVxuICAgIClcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyRWxlbWVudChlbGVtZW50OiBFbGVtZW50KTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIHRoaXMucXJjRWxlbWVudC5uYXRpdmVFbGVtZW50LmNoaWxkTm9kZXMpIHtcbiAgICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlQ2hpbGQodGhpcy5xcmNFbGVtZW50Lm5hdGl2ZUVsZW1lbnQsIG5vZGUpXG4gICAgfVxuICAgIHRoaXMucmVuZGVyZXIuYXBwZW5kQ2hpbGQodGhpcy5xcmNFbGVtZW50Lm5hdGl2ZUVsZW1lbnQsIGVsZW1lbnQpXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNyZWF0ZVFSQ29kZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBTZXQgc2Vuc2l0aXZlIGRlZmF1bHRzXG4gICAgaWYgKHRoaXMudmVyc2lvbiAmJiB0aGlzLnZlcnNpb24gPiA0MCkge1xuICAgICAgY29uc29sZS53YXJuKFwiW2FuZ3VsYXJ4LXFyY29kZV0gbWF4IHZhbHVlIGZvciBgdmVyc2lvbmAgaXMgNDBcIilcbiAgICAgIHRoaXMudmVyc2lvbiA9IDQwXG4gICAgfSBlbHNlIGlmICh0aGlzLnZlcnNpb24gJiYgdGhpcy52ZXJzaW9uIDwgMSkge1xuICAgICAgY29uc29sZS53YXJuKFwiW2FuZ3VsYXJ4LXFyY29kZV1gbWluIHZhbHVlIGZvciBgdmVyc2lvbmAgaXMgMVwiKVxuICAgICAgdGhpcy52ZXJzaW9uID0gMVxuICAgIH0gZWxzZSBpZiAodGhpcy52ZXJzaW9uICE9PSB1bmRlZmluZWQgJiYgaXNOYU4odGhpcy52ZXJzaW9uKSkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBcIlthbmd1bGFyeC1xcmNvZGVdIHZlcnNpb24gc2hvdWxkIGJlIGEgbnVtYmVyLCBkZWZhdWx0aW5nIHRvIGF1dG8uXCJcbiAgICAgIClcbiAgICAgIHRoaXMudmVyc2lvbiA9IHVuZGVmaW5lZFxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBpZiAoIXRoaXMuaXNWYWxpZFFyQ29kZVRleHQodGhpcy5xcmRhdGEpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBcIlthbmd1bGFyeC1xcmNvZGVdIEZpZWxkIGBxcmRhdGFgIGlzIGVtcHR5LCBzZXQgJ2FsbG93RW1wdHlTdHJpbmc9XFxcInRydWVcXFwiJyB0byBvdmVyd3JpdGUgdGhpcyBiZWhhdmlvdXIuXCJcbiAgICAgICAgKVxuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIGlzIGEgd29ya2Fyb3VuZCB0byBhbGxvdyBhbiBlbXB0eSBzdHJpbmcgYXMgcXJkYXRhXG4gICAgICBpZiAodGhpcy5pc1ZhbGlkUXJDb2RlVGV4dCh0aGlzLnFyZGF0YSkgJiYgdGhpcy5xcmRhdGEgPT09IFwiXCIpIHtcbiAgICAgICAgdGhpcy5xcmRhdGEgPSBcIiBcIlxuICAgICAgfVxuXG4gICAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICAgIGNvbG9yOiB7XG4gICAgICAgICAgZGFyazogdGhpcy5jb2xvckRhcmssXG4gICAgICAgICAgbGlnaHQ6IHRoaXMuY29sb3JMaWdodCxcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWw6IHRoaXMuZXJyb3JDb3JyZWN0aW9uTGV2ZWwsXG4gICAgICAgIG1hcmdpbjogdGhpcy5tYXJnaW4sXG4gICAgICAgIHNjYWxlOiB0aGlzLnNjYWxlLFxuICAgICAgICB2ZXJzaW9uOiB0aGlzLnZlcnNpb24sXG4gICAgICAgIHdpZHRoOiB0aGlzLndpZHRoLFxuICAgICAgfVxuXG4gICAgICBjb25zdCBjZW50ZXJJbWFnZVNyYyA9IHRoaXMuaW1hZ2VTcmNcbiAgICAgIGNvbnN0IGNlbnRlckltYWdlSGVpZ2h0ID0gdGhpcy5pbWFnZUhlaWdodCB8fCA0MFxuICAgICAgY29uc3QgY2VudGVySW1hZ2VXaWR0aCA9IHRoaXMuaW1hZ2VXaWR0aCB8fCA0MFxuXG4gICAgICBzd2l0Y2ggKHRoaXMuZWxlbWVudFR5cGUpIHtcbiAgICAgICAgY2FzZSBcImNhbnZhc1wiOiB7XG4gICAgICAgICAgY29uc3QgY2FudmFzRWxlbWVudDogSFRNTENhbnZhc0VsZW1lbnQgPVxuICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpXG4gICAgICAgICAgdGhpcy5jb250ZXh0ID0gY2FudmFzRWxlbWVudC5nZXRDb250ZXh0KFwiMmRcIilcbiAgICAgICAgICB0aGlzLnRvQ2FudmFzKGNhbnZhc0VsZW1lbnQsIGNvbmZpZylcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuYXJpYUxhYmVsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgICAgICAgICBjYW52YXNFbGVtZW50LFxuICAgICAgICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCIsXG4gICAgICAgICAgICAgICAgICBgJHt0aGlzLmFyaWFMYWJlbH1gXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICh0aGlzLnRpdGxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgICAgICAgICBjYW52YXNFbGVtZW50LFxuICAgICAgICAgICAgICAgICAgXCJ0aXRsZVwiLFxuICAgICAgICAgICAgICAgICAgYCR7dGhpcy50aXRsZX1gXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKGNlbnRlckltYWdlU3JjICYmIHRoaXMuY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2VudGVySW1hZ2UgPSBuZXcgSW1hZ2UoXG4gICAgICAgICAgICAgICAgICBjZW50ZXJJbWFnZVdpZHRoLFxuICAgICAgICAgICAgICAgICAgY2VudGVySW1hZ2VIZWlnaHRcbiAgICAgICAgICAgICAgICApXG5cbiAgICAgICAgICAgICAgICBpZiAoY2VudGVySW1hZ2VTcmMgIT09IHRoaXMuY2VudGVySW1hZ2Uuc3JjKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLmNlbnRlckltYWdlLnNyYyA9IGNlbnRlckltYWdlU3JjXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGNlbnRlckltYWdlSGVpZ2h0ICE9PSB0aGlzLmNlbnRlckltYWdlLmhlaWdodCkge1xuICAgICAgICAgICAgICAgICAgdGhpcy5jZW50ZXJJbWFnZS5oZWlnaHQgPSBjZW50ZXJJbWFnZUhlaWdodFxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjZW50ZXJJbWFnZVdpZHRoICE9PSB0aGlzLmNlbnRlckltYWdlLndpZHRoKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLmNlbnRlckltYWdlLndpZHRoID0gY2VudGVySW1hZ2VXaWR0aFxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGNlbnRlckltYWdlID0gdGhpcy5jZW50ZXJJbWFnZVxuXG4gICAgICAgICAgICAgICAgaWYgKGNlbnRlckltYWdlKSB7XG4gICAgICAgICAgICAgICAgICBjZW50ZXJJbWFnZS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dD8uZHJhd0ltYWdlKFxuICAgICAgICAgICAgICAgICAgICAgIGNlbnRlckltYWdlLFxuICAgICAgICAgICAgICAgICAgICAgIGNhbnZhc0VsZW1lbnQud2lkdGggLyAyIC0gY2VudGVySW1hZ2VXaWR0aCAvIDIsXG4gICAgICAgICAgICAgICAgICAgICAgY2FudmFzRWxlbWVudC5oZWlnaHQgLyAyIC0gY2VudGVySW1hZ2VIZWlnaHQgLyAyLFxuICAgICAgICAgICAgICAgICAgICAgIGNlbnRlckltYWdlV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgY2VudGVySW1hZ2VIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHRoaXMucmVuZGVyRWxlbWVudChjYW52YXNFbGVtZW50KVxuICAgICAgICAgICAgICB0aGlzLmVtaXRRUkNvZGVVUkwoY2FudmFzRWxlbWVudCBhcyBIVE1MQ2FudmFzRWxlbWVudClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlthbmd1bGFyeC1xcmNvZGVdIGNhbnZhcyBlcnJvcjpcIiwgZSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwic3ZnXCI6IHtcbiAgICAgICAgICBjb25zdCBzdmdQYXJlbnRFbGVtZW50OiBIVE1MRWxlbWVudCA9XG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICAgICAgICB0aGlzLnRvU1ZHKGNvbmZpZylcbiAgICAgICAgICAgIC50aGVuKChzdmdTdHJpbmc6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFByb3BlcnR5KFxuICAgICAgICAgICAgICAgIHN2Z1BhcmVudEVsZW1lbnQsXG4gICAgICAgICAgICAgICAgXCJpbm5lckhUTUxcIixcbiAgICAgICAgICAgICAgICBzdmdTdHJpbmdcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICBjb25zdCBzdmdFbGVtZW50ID0gc3ZnUGFyZW50RWxlbWVudC5maXJzdENoaWxkIGFzIFNWR1NWR0VsZW1lbnRcbiAgICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRBdHRyaWJ1dGUoc3ZnRWxlbWVudCwgXCJoZWlnaHRcIiwgYCR7dGhpcy53aWR0aH1gKVxuICAgICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnNldEF0dHJpYnV0ZShzdmdFbGVtZW50LCBcIndpZHRoXCIsIGAke3RoaXMud2lkdGh9YClcbiAgICAgICAgICAgICAgdGhpcy5yZW5kZXJFbGVtZW50KHN2Z0VsZW1lbnQpXG4gICAgICAgICAgICAgIHRoaXMuZW1pdFFSQ29kZVVSTChzdmdFbGVtZW50KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiW2FuZ3VsYXJ4LXFyY29kZV0gc3ZnIGVycm9yOlwiLCBlKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJ1cmxcIjpcbiAgICAgICAgY2FzZSBcImltZ1wiOlxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgY29uc3QgaW1nRWxlbWVudDogSFRNTEltYWdlRWxlbWVudCA9XG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmNyZWF0ZUVsZW1lbnQoXCJpbWdcIilcbiAgICAgICAgICB0aGlzLnRvRGF0YVVSTChjb25maWcpXG4gICAgICAgICAgICAudGhlbigoZGF0YVVybDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLmFsdCkge1xuICAgICAgICAgICAgICAgIGltZ0VsZW1lbnQuc2V0QXR0cmlidXRlKFwiYWx0XCIsIHRoaXMuYWx0KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICh0aGlzLmFyaWFMYWJlbCkge1xuICAgICAgICAgICAgICAgIGltZ0VsZW1lbnQuc2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiLCB0aGlzLmFyaWFMYWJlbClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpbWdFbGVtZW50LnNldEF0dHJpYnV0ZShcInNyY1wiLCBkYXRhVXJsKVxuICAgICAgICAgICAgICBpZiAodGhpcy50aXRsZSkge1xuICAgICAgICAgICAgICAgIGltZ0VsZW1lbnQuc2V0QXR0cmlidXRlKFwidGl0bGVcIiwgdGhpcy50aXRsZSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0aGlzLnJlbmRlckVsZW1lbnQoaW1nRWxlbWVudClcbiAgICAgICAgICAgICAgdGhpcy5lbWl0UVJDb2RlVVJMKGltZ0VsZW1lbnQpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJbYW5ndWxhcngtcXJjb2RlXSBpbWcvdXJsIGVycm9yOlwiLCBlKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGU6IEZpeE1lTGF0ZXIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJbYW5ndWxhcngtcXJjb2RlXSBFcnJvciBnZW5lcmF0aW5nIFFSIENvZGU6XCIsIGUubWVzc2FnZSlcbiAgICB9XG4gIH1cblxuICBlbWl0UVJDb2RlVVJMKGVsZW1lbnQ6IEhUTUxDYW52YXNFbGVtZW50IHwgSFRNTEltYWdlRWxlbWVudCB8IFNWR1NWR0VsZW1lbnQpIHtcbiAgICBjb25zdCBjbGFzc05hbWUgPSBlbGVtZW50LmNvbnN0cnVjdG9yLm5hbWVcbiAgICBpZiAoY2xhc3NOYW1lID09PSBTVkdTVkdFbGVtZW50Lm5hbWUpIHtcbiAgICAgIGNvbnN0IHN2Z0hUTUwgPSBlbGVtZW50Lm91dGVySFRNTFxuICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtzdmdIVE1MXSwgeyB0eXBlOiBcImltYWdlL3N2Zyt4bWxcIiB9KVxuICAgICAgY29uc3QgdXJsU3ZnID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKVxuICAgICAgY29uc3QgdXJsU2FuaXRpemVkID0gdGhpcy5zYW5pdGl6ZXIuYnlwYXNzU2VjdXJpdHlUcnVzdFVybCh1cmxTdmcpXG4gICAgICB0aGlzLnFyQ29kZVVSTC5lbWl0KHVybFNhbml0aXplZClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGxldCB1cmxJbWFnZSA9IFwiXCJcblxuICAgIGlmIChjbGFzc05hbWUgPT09IEhUTUxDYW52YXNFbGVtZW50Lm5hbWUpIHtcbiAgICAgIHVybEltYWdlID0gKGVsZW1lbnQgYXMgSFRNTENhbnZhc0VsZW1lbnQpLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKVxuICAgIH1cblxuICAgIGlmIChjbGFzc05hbWUgPT09IEhUTUxJbWFnZUVsZW1lbnQubmFtZSkge1xuICAgICAgdXJsSW1hZ2UgPSAoZWxlbWVudCBhcyBIVE1MSW1hZ2VFbGVtZW50KS5zcmNcbiAgICB9XG5cbiAgICBmZXRjaCh1cmxJbWFnZSlcbiAgICAgIC50aGVuKCh1cmxSZXNwb25zZTogUmVzcG9uc2UpID0+IHVybFJlc3BvbnNlLmJsb2IoKSlcbiAgICAgIC50aGVuKChibG9iOiBCbG9iKSA9PiBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpKVxuICAgICAgLnRoZW4oKHVybDogc3RyaW5nKSA9PiB0aGlzLnNhbml0aXplci5ieXBhc3NTZWN1cml0eVRydXN0VXJsKHVybCkpXG4gICAgICAudGhlbigodXJsU2FuaXRpemVkOiBTYWZlVXJsKSA9PiB7XG4gICAgICAgIHRoaXMucXJDb2RlVVJMLmVtaXQodXJsU2FuaXRpemVkKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICBcIlthbmd1bGFyeC1xcmNvZGVdIEVycm9yIHdoZW4gZmV0Y2hpbmcgaW1hZ2UvcG5nIFVSTDogXCIgKyBlcnJvclxuICAgICAgICApXG4gICAgICB9KVxuICB9XG59XG4iXX0=