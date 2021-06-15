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
        },
        {
            style: 'tableExample',
            table: {
                widths: ['auto', 'auto'],
                body: [
                    [{ text: `         `, noWrap: true, style: 'sectionLine', width: 50 }, { text: 'Experience', style: 'sectionHeading', }],
                    ...data.experiences.map(item => ([{ text: `${new Date(item.startDate).toLocaleDateString('default', { month: 'short', year: '2-digit' })}-${new Date(item.startDate).toLocaleDateString('default', { month: 'short', year: '2-digit' })}`, noWrap: true },
                    { text: [{ text: `${item.role}`, bold: true }, { text: `\n${item.company}, `, italics: true, fontSize: 14 }, { text: `${item.area}\n`, fontSize: 14 }, { text: `${item.description}\n`, margin: [0, 0, 0, 5] }] }])),
                ]
            }, layout: 'noBorders'
        }
        ],


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
            },
            header: {
                margin: [0, 0, 0, 40]
            },
            tableExample: {
                lineHeight: 1.15,
                fontSize: 15,
                margin: [0, 5, 0, 15]
            },
            sectionLine: {
                fontSize: 25,
                decoration: 'underline',
                decorationColor: '#3873B2',
                margin: [60, 0, 0, 0]
            },
            sectionHeading: {
                color: '#3873B2',
                fontSize: 20,
                bold: true
            }
        }

    }



    const options = {}

    const pdfReadableStream = printer.createPdfKitDocument(docDefinition, options)
    pdfReadableStream.end()

    return pdfReadableStream
}

export default generatePDFStream
