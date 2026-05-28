import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import PDFDocument from 'pdfkit';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Reading } from '../readings/entities/readings.entity';

@Injectable()
export class ReportsService {

  constructor(
    @InjectRepository(Reading)
    private readonly readingRepository: Repository<Reading>,
  ) {}

  async generateReport(
    cct: string,
    start: string,
    end: string,
  ) {
    if (!start || !end) {
      throw new BadRequestException(
        'Debes enviar fecha de inicio y fecha final',
      );
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    endDate.setHours(23, 59, 59, 999);

    const totalResiduos =
    await this.readingRepository
      .createQueryBuilder('l')
      .innerJoin('l.container', 'c')
      .innerJoin('c.area', 'a')
      .select('SUM(l.conteo)', 'total')
      .where('a.cct = :cct', { cct })
      .andWhere('l.timestamp BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .getRawOne();

    const porTipo =
    await this.readingRepository
      .createQueryBuilder('l')
      .innerJoin('l.container', 'c')
      .innerJoin('c.area', 'a')
      .select('c.tipo', 'tipo')
      .addSelect('SUM(l.conteo)', 'total')
      .where('a.cct = :cct', { cct })
      .andWhere('l.timestamp BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('c.tipo')
      .getRawMany();

    const porArea =
    await this.readingRepository
      .createQueryBuilder('l')
      .innerJoin('l.container', 'c')
      .innerJoin('c.area', 'a')
      .select('a.nombre', 'area')
      .addSelect('a.color', 'color')
      .addSelect('SUM(l.conteo)', 'total')
      .where('a.cct = :cct', { cct })
      .andWhere('l.timestamp BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('a.id')
      .addGroupBy('a.nombre')
      .addGroupBy('a.color')
      .getRawMany();

    const registros =
    await this.readingRepository
      .createQueryBuilder('l')
      .innerJoin('l.container', 'c')
      .innerJoin('c.area', 'a')
      .select('l.id', 'id')
      .addSelect('c.tipo', 'tipo')
      .addSelect('a.nombre', 'area')
      .addSelect('l.conteo', 'conteo')
      .addSelect('l.timestamp', 'fecha')
      .where('a.cct = :cct', { cct })
      .andWhere('l.timestamp BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .orderBy('l.timestamp', 'DESC')
      .getRawMany();

    return {
      periodo: {
        inicio: start,
        fin: end,
      },
      totalResiduos: Number(totalResiduos.total) || 0,
      porTipo: porTipo.map(item => ({
        tipo: item.tipo,
        total: Number(item.total),
      })),
      porArea: porArea.map(item => ({
        area: item.area,
        color: item.color,
        total: Number(item.total),
      })),
      registros: registros.map(item => ({
        id: Number(item.id),
        tipo: item.tipo,
        area: item.area,
        conteo: Number(item.conteo),
        fecha: item.fecha,
      })),
    };
  }
  async generatePdfReport(
  cct: string,
  start: string,
  end: string,
  res: Response,
) {
  const report = await this.generateReport(cct, start, end);

  const doc = new PDFDocument({
    margin: 50,
    size: 'A4',
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=reporte-giru-${start}-${end}.pdf`,
  );

  doc.pipe(res);

  // Encabezado
  doc
    .fontSize(22)
    .text('GRU', { align: 'center' });

  doc
    .fontSize(14)
    .text('Reporte de Gestión de Residuos Urbanos', {
      align: 'center',
    });

  doc.moveDown();

  doc
    .fontSize(10)
    .text(`Periodo: ${report.periodo.inicio} al ${report.periodo.fin}`);

  doc
    .fontSize(10)
    .text(`Fecha de generación: ${new Date().toLocaleDateString()}`);

  doc.moveDown();

  this.drawLine(doc);

  doc.moveDown();

  // Resumen
  this.drawSectionTitle(doc, 'Resumen general');

  doc
    .fontSize(12)
    .text(`Total de residuos registrados: ${report.totalResiduos}`);

  doc.moveDown();

  // Tabla por tipo
  this.drawSectionTitle(doc, 'Residuos por tipo');

  this.drawTable(
    doc,
    ['Tipo de residuo', 'Total'],
    report.porTipo.map(item => [
      item.tipo,
      item.total.toString(),
    ]),
  );

  doc.moveDown();

  // Tabla por área
  this.drawSectionTitle(doc, 'Residuos por área');

  this.drawTable(
    doc,
    ['Área', 'Total'],
    report.porArea.map(item => [
      item.area,
      item.total.toString(),
    ]),
  );

  doc.moveDown();

  // Registros
  this.drawSectionTitle(doc, 'Registros del periodo');

  this.drawTable(
    doc,
    ['ID', 'Tipo', 'Área', 'Conteo', 'Fecha'],
    report.registros.map(item => [
      item.id.toString(),
      item.tipo,
      item.area,
      item.conteo.toString(),
      new Date(item.fecha).toLocaleString(),
    ]),
  );

  doc.end();
}
private drawSectionTitle(
  doc: PDFKit.PDFDocument,
  title: string,
) {
  doc
    .fontSize(15)
    .text(title, {
      underline: true,
    });

  doc.moveDown(0.5);
}
private drawLine(
  doc: PDFKit.PDFDocument,
) {
  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();
}
private drawTable(
  doc: PDFKit.PDFDocument,
  headers: string[],
  rows: string[][],
) {
  const startX = 50;
  let y = doc.y;

  const columnWidth = 495 / headers.length;
  const rowHeight = 22;

  // Encabezados
  headers.forEach((header, index) => {
    doc
      .fontSize(10)
      .text(
        header,
        startX + index * columnWidth,
        y,
        {
          width: columnWidth,
          align: 'left',
        },
      );
  });

  y += rowHeight;

  doc
    .moveTo(startX, y - 5)
    .lineTo(545, y - 5)
    .stroke();

  // Filas
  rows.forEach(row => {
    if (y > 750) {
      doc.addPage();
      y = 50;
    }

    row.forEach((cell, index) => {
      doc
        .fontSize(9)
        .text(
          cell,
          startX + index * columnWidth,
          y,
          {
            width: columnWidth,
            align: 'left',
          },
        );
    });

    y += rowHeight;
  });

  doc.y = y + 10;
}
}