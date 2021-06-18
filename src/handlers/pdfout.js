import PdfPrinter from "pdfmake"
import axios from "axios"
import { extname } from "path"

const generatePDFStream = async data => {
    let imagePart = {}
    if (data.image) {
        const image = await axios.get(data.image, { responseType: "arraybuffer" })
        const mime = extname(data.image)
        const base64 = image.data.toString("base64")
        const base64Image = `data:image/${mime};base64,${base64}`
        imagePart = { image: base64Image, width: 100, height: 100, margin: [0, 25, 0, 0] }
    }

    const fonts = {
        Roboto: {
            normal: "Times-Roman",
            bold: "Times-Bold",
            italics: "Times-Italic",
            bolditalics: "Times-BoldItalic"
        }
    }

    const printer = new PdfPrinter(fonts)

    const docDefinition = {
        pageMargins: [50, 0, 30, 0],
        content: [
            {
                columns: [
                    {
                        text: `${data.name} ${data.surname}`,
                        style: "name"
                    },
                    { text: `${data.title}\n${data.email}\n${data.area} `, style: "biodata" },
                    imagePart
                ],
                style: "header"
            },
            {
                style: "tableExample",
                table: {
                    widths: ["auto", "auto"],
                    body: [
                        [
                            {
                                canvas: [
                                    {
                                        type: "line",
                                        x1: 0,
                                        y1: 6,
                                        x2: 85,
                                        y2: 6,
                                        lineWidth: 5,
                                        lineColor: "#3873B2"
                                    }
                                ]
                            },
                            { text: "Experience", style: "sectionHeading" }
                        ],
                        ...data.experiences.map(item => [
                            {
                                text: `${new Date(item.startDate).toLocaleDateString("default", { month: "short", year: "2-digit" })}-${new Date(
                                    item.endDate
                                ).toLocaleDateString("default", { month: "short", year: "2-digit" })}`,
                                noWrap: true,
                                margin: [0, 2.5, 0, 0]
                            },
                            {
                                text: [
                                    { text: `${item.role}`, bold: true },
                                    { text: `\n${item.company}, `, italics: true, style: "sectionBody" },
                                    { text: `${item.area}\n`, style: "sectionBody" },
                                    { text: `${item.description}`, style: "sectionBody" }
                                ],
                                margin: [7.5, 2.5, 0, 5]
                            }
                        ])
                    ]
                },
                layout: "noBorders"
            }
        ],

        styles: {
            name: {
                lineHeight: 1.25,
                fontSize: 25,
                bold: true,
                alignment: "Left",
                margin: [0, 50, 0, 0]
            },
            biodata: {
                lineHeight: 1.25,
                fontSize: 15,
                alignment: "right",
                margin: [0, 40, 15, 0]
            },
            header: {
                margin: [0, 0, 0, 40]
            },
            tableExample: {
                lineHeight: 1.15,
                fontSize: 15,
                margin: [0, 5, 0, 15]
            },
            sectionBody: {
                fontSize: 15,
                lineHeight: 1.35
            },
            sectionHeading: {
                color: "#3873B2",
                fontSize: 20,
                bold: true,
                margin: [5, 0, 0, 0]
            }
        }
    }

    const options = {}

    const pdfReadableStream = printer.createPdfKitDocument(docDefinition, options)
    pdfReadableStream.end()

    return pdfReadableStream
}

export default generatePDFStream
