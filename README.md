# jotto-qrcode - Jotto QR Code Generator

`jotto-qrcode` - a fast and easy-to-use QR Code Generator library for Jotto

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Available Parameters](#available-parameters)
- [Contribute](#contribute)
- [License](#license)

## Features

- Compatible with **Angular** and Ionic
- Ivy compiler support, AOT, SSR (Server Side Rendering)
- Under active development
- Accessibility (a11y) attributes supported (alt, aria-label, title)
- Support for images
- Trusted and used by thousands of developers like you

`jotto-qrcode` is compatible with Ionic 3/4/5 and Angular 4/5/6/7/8/9/10/11/12/13/14/15+ with support for the Ivy compiler. It is a drop-in replacement for the no-longer-maintained angular component ng2-qrcode and based on node-qrcode.

## Installation

**Angular 16 and Ionic with jotto-qrcode 16**

```
npm install jotto-qrcode --save
# Or with yarn
yarn add jotto-qrcode
```

**Angular 15 and Ionic with jotto-qrcode 15**

```
npm install jotto-qrcode@15.0.1 --save
# Or with yarn
yarn add jotto-qrcode
```

**Angular 14 and Ionic with jotto-qrcode 14**

```
npm install jotto-qrcode@14.0.0 --save
# Or with yarn
yarn add jotto-qrcode@14.0.0
```

**Angular 13 and Ionic with jotto-qrcode 13**

```
npm install jotto-qrcode@13.0.15 --save
# Or with yarn
yarn add jotto-qrcode@13.0.15
```

**Angular 12 and Ionic**

```
npm install jotto-qrcode@12.0.3 --save
# Or with yarn
yarn add jotto-qrcode@12.0.3
```

**Angular 11 and Ionic**

```
npm install jotto-qrcode@11.0.0 --save
# Or with yarn
yarn add jotto-qrcode@11.0.0
```

**Older supported angular versions**

```
# angular 10 and Ionic
npm install jotto-qrcode@10.0.12 --save
# angular 9 and Ionic
npm install jotto-qrcode@~2.3.7 --save
# angular 8 and Ionic
npm install jotto-qrcode@~2.1.4 --save
# angular 5/6/7
npm install jotto-qrcode@1.6.4 --save
# Angular 4
npm install jotto-qrcode@1.0.3 --save
```

# Usage

### Import the module and add it to your imports section in your main AppModule:

```
// File: app.module.ts
// all your other imports...
import { QRCodeModule } from 'jotto-qrcode';

@NgModule({
declarations: [
  AppComponent
],
imports: [
  QRCodeModule
],
providers: [],
bootstrap: [AppComponent]
})
export class AppModule { }
```

```
// File: app.component.html
// all your HTML...

<qrcode [qrdata]="'Your data string'" [width]="256" [errorCorrectionLevel]="'M'"></qrcode>
```

### Generate a QR Code from a string (directive only)

Now that angular/Ionic know about the new QR Code module,
let's invoke it from our template with a directive.
If we use a simple text-string, we need no additional
code in our controller.

```
<qrcode [qrdata]="'Your data string'" [width]="256" [errorCorrectionLevel]="'M'"></qrcode>
```

### Create a QR Code from a variable in your controller

In addition to our `<qrcode>`-directive in `app.component.html`,
lets add two lines of code to our controller `app.component.ts`.

```
// File: app.component.ts
export class QRCodeComponent {
  public myAngularxQrCode: string = null;
  constructor () {
    // assign a value
    this.myAngularxQrCode = 'Your QR code data string';
  }
}

// File: app.component.html
<qrcode [qrdata]="myAngularxQrCode" [width]="256" [errorCorrectionLevel]="'M'"></qrcode>
```

### Getting the QR Code URL

To download the QR Code, we have to use the `qrCodeURL` attribute
of the `<qrcode>` which returns a sanitized URL representing the
location of the QR Code.

```
// File: example.ts
export class QRCodeComponent {
  public myAngularxQrCode: string = "";
  public qrCodeDownloadLink: SafeUrl = "";

  constructor () {
    this.myAngularxQrCode = 'Your QR code data string';
  }

  onChangeURL(url: SafeUrl) {
    this.qrCodeDownloadLink = url;
  }
}

// File: example.html
<qrcode (qrCodeURL)="onChangeURL($event)" [qrdata]="myAngularxQrCode" [width]="256" [errorCorrectionLevel]="'M'"></qrcode>
<a [href]="qrCodeDownloadLink" download="qrcode">Download</a>
```

The file format obtained by `qrCodeURL` depends directly on the
elementType of `<qrcode>`. If it's either canvas, url or image,
it returns an image as `.png`, if it's svg, returns a `.svg` file.

## Available Parameters

| Attribute            | Type                    | Default     | Description                                                     |
|----------------------|-------------------------| ----------- |-----------------------------------------------------------------|
| allowEmptyString     | Boolean                 | false       | Allow qrdata to be an empty string                              |
| alt                  | String                  | null        | HTML alt attribute (supported by img, url)                      |
| ariaLabel            | String                  | null        | HTML aria-label attribute (supported by canvas, img, url)       |
| colorDark            | String                  | '#000000ff' | RGBA color, color of dark module (foreground)                   |
| colorLight           | String                  | '#ffffffff' | RGBA color, color of light module (background)                  |
| cssClass             | String                  | 'qrcode'    | CSS Class                                                       |
| elementType          | String                  | 'canvas'    | 'canvas', 'svg', 'img', 'url' (alias for 'img')                 |
| errorCorrectionLevel | String                  | 'M'         | QR Correction level ('L', 'M', 'Q', 'H')                        |
| imageSrc             | String                  | null        | Link to your image                                              |
| imageHeight          | Number                  | null        | height of your image                                            |
| imageWidth           | Number                  | null        | width of your image                                             |
| imageRadius          | String                  | null        | radius of your image                                            |
| margin               | Number                  | 4           | Define how much wide the quiet zone should be.                  |
| qrCodeURL            | EventEmitter\<SafeUrl\> |             | Returns the QR Code URL                                         |
| qrdata               | String                  | ''          | String to encode                                                |
| scale                | Number                  | 4           | Scale factor. A value of 1 means 1px per modules (black dots).  |
| title                | String                  | null        | HTML title attribute (supported by canvas, img, url)            |
| version              | Number                  | (auto)      | 1-40                                                            |
| width                | Number                  | 10          | Height/Width (any value)                                        |

## QR Code capacity

Depending on the amount of data of the **qrdata** to encode, a minimum **width** is required.


## AOT - Ahead Of Time Compilation

`jotto-qrcode` supports AOT Compilation (Ahead-of-Time Compilation) which results in significant faster rendering. An AOT-enabled module is included. Further reading: https://angular.io/guide/aot-compiler

## Contribute

- Please open your PR against the development branch.
- Make sure your editor uses **prettier** to minimize commited code changes.

## License

MIT License
