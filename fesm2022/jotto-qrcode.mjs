import * as i0 from '@angular/core';
import { EventEmitter, Component, ChangeDetectionStrategy, Input, Output, ViewChild, NgModule } from '@angular/core';
import { toDataURL, toCanvas, toString } from 'qrcode';
import * as i1 from '@angular/platform-browser';

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

class QRCodeModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: QRCodeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.0.0", ngImport: i0, type: QRCodeModule, declarations: [QRCodeComponent], exports: [QRCodeComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: QRCodeModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: QRCodeModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [],
                    declarations: [QRCodeComponent],
                    exports: [QRCodeComponent],
                }]
        }] });

export { QRCodeComponent, QRCodeModule };
//# sourceMappingURL=jotto-qrcode.mjs.map
