import React, { Component, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf'
// right after your imports
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
import { Segment, Flex } from '@fluentui/react-northstar'
import { Paper } from '../types';
import { getPaperLocation } from '../utils/paper';

type PdfViewerProps = {
  width: number;
  paper?: Paper;
}

type PdfViewerState = {
  numPages: number
}

export default ({ width, paper }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState(0);

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);
  // const content = fs.readFileSync('/Users/trung/Documents/1508.01211.pdf', {encoding: 'base64'});

  const onItemClick = ({ pageNumber: itemPageNumber }) => {
    setPageNumber(itemPageNumber);
  }


    return (
      <div style={{overflow: 'auto', height: 'calc(100vh - 80px)', width, backgroundColor: 'gray', padding: '8px'}}>
        { paper && (
          <Document
            file={getPaperLocation(paper!) || paper!.url}
            onLoadSuccess={onDocumentLoadSuccess}
            onItemClick={onItemClick}
          >
            <Flex column gap="gap.small" width={width - 16}>
              {Array.from(
                new Array(numPages),
                (el, index) => (
                  <Page
                    size="A4"
                    width={width - 24}
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                  />
                ),
              )}
            </Flex>
          </Document>)
        }
      </div>
    )
}
