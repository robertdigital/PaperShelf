import { Flex, Header, Button, AddIcon, Text } from '@fluentui/react-northstar';
import React, { useEffect, useState } from 'react';
import Paper, { fetchPaper } from '../utils/paper';
import { SimplePaper } from '../utils/simplepaper';

const PaperInfoPopup = ({
  paper,
  onLoaded,
  addToLibrary,
}: {
  paper: SimplePaper | null;
  onLoaded: () => void;
  addToLibrary: (p: Paper) => void;
}) => {
  const [fetchedPaper, setFetchedPaper] = useState<Paper>();

  useEffect(() => {
    if (paper) {
      fetchPaper(
        new Paper({
          title: paper?.title,
          pdfUrl: paper?.pdfUrl,
          authors: paper?.authors,
        })
      )
        .then((p) => p.populateFieldsFromSources())
        .then((p) => setFetchedPaper(p))
        .then(onLoaded)
        .catch(() => {});
    } else {
      setFetchedPaper(undefined);
    }
  }, [paper]);

  return (
    <Flex column style={{ maxWidth: '500px' }}>
      {fetchedPaper ? (
        <Flex column>
          <Header as="h3">{fetchedPaper?.title}</Header>
          <Text temporary content={fetchedPaper?.authors.join(', ')} />
          <Text content={fetchedPaper?.abstract} as="p" />
        </Flex>
      ) : (
        <Text temporary content="No paper found." as="p" />
      )}

      <Flex hAlign="end">
        <Button
          text
          content="Add to Library"
          icon={<AddIcon />}
          onClick={() => {
            if (fetchedPaper) addToLibrary(fetchedPaper);
          }}
          disabled={!fetchedPaper?.pdfUrl || fetchedPaper?.inLibrary}
        />
      </Flex>
    </Flex>
  );
};

export default PaperInfoPopup;
