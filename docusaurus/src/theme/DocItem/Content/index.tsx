import React, {type ReactNode} from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type {WrapperProps} from '@docusaurus/types';
import NeuralPersonalizeButton from '@site/src/components/NeuralPersonalizeButton';
import ContentTransformer from '@site/src/components/ContentTransformer';

type Props = WrapperProps<typeof ContentType>;

export default function ContentWrapper(props: Props): ReactNode {
  return (
    <>
      <ContentTransformer />
      <NeuralPersonalizeButton />
      <Content {...props} />
    </>
  );
}