import PdfPrinter from "pdfmake"
import userModel from "../schema/user.js"
import axios from "axios"
import { extname } from 'path'


const generatePDFStream = async data => {
    let imagePart = {}
    if (data.image) {
        const image = await axios.get(data.image, { responseType: 'arraybuffer' })
        const mime = extname(data.image)
        const base64 = image.data.toString('base64')
        const base64Image = `data:image/${mime};base64,${base64}`
        imagePart = { image: base64Image, width: 100, height: 100, margin: [15, 25, 15, 0] }
    }

    const fonts = {
        Roboto: {
            normal: "Helvetica",
            bold: "Helvetica-Bold",
            italics: "Helvetica-Oblique",
            bolditalics: "Helvetica-BoldOblique"
        }
    }
    /*   text: `${data.name} ${data.surname}`, style: 'bio', fontSize: 20, },
      { text: `${data.title} \n ${data.email}`, lineHeight: 1.25, bold: false, fontSize: 15, margin: [0, 0, 0, 0]
   */
    const printer = new PdfPrinter(fonts)

    const docDefinition = {
        content: [{
            columns: [
                {
                    text: `${data.name} ${data.surname}`, style: 'name'
                },
                { text: `${data.title}\n${data.email}\n${data.area} `, style: 'biodata' },
                imagePart
            ],
            style: 'header'
        }],


        styles: {
            name: {
                lineHeight: 1.25,
                fontSize: 25,
                bold: true,
                alignment: 'Left',
                margin: [0, 50, 0, 0]
            },
            biodata: {
                lineHeight: 1.25,
                fontSize: 15,
                alignment: 'right',
                margin: [0, 40, 0, 0]
            }
        }

    }



    const options = {}

    const pdfReadableStream = printer.createPdfKitDocument(docDefinition, options)
    pdfReadableStream.end()

    return pdfReadableStream
}

export default generatePDFStream
