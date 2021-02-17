import { css } from '@emotion/react';
import React, { ReactNode } from 'react';

export type Props = {
  /**
   * React children, usually text.
   */
  children: ReactNode;

  /**
   * Text to display as HTML title attribute.
   */
  title?: string;

  // XXX Implementation idea: Allow to configure the title to display as tooltip instead of HTML title (prettier)
  titleAsTooltip?: boolean;

  /**
   * Width on large devices.
   *
   * @default 100%
   */
  widthLarge?: string;

  /**
   * Width on medium devices.
   *
   * @default 100%
   */
  widthMedium?: string;

  /**
   * Width on small devices.
   *
   * @default 100%
   */
  widthSmall?: string;

  /**
   * Number of lines to show.
   *
   * @default 5
   */
  lineClamp?: number;
}

/**
 * Ellipsis component meant to display text as an ellipsis ("...") when the text is too long.
 *
 * Helps avoiding long text taking too much space and basically crop it instead.
 * Text in multiples lines.
 *
 * @param props
 */
const EllipsisTextMultiline: React.FunctionComponent<Props> = (props): JSX.Element => {
  const {
    widthLarge = '100%',
    widthMedium = '100%',
    widthSmall = '100%',
    title,
    lineClamp = 5,
    titleAsTooltip = true,
    children,
  } = props;

  const dynamicProps = {};

  return (
    <div
      css={css`
            position: relative;

            .tooltiptext {
                visibility: hidden;
                width: 120px;
                background-color: black;
                color: #fff;
                text-align: center;
                border-radius: 6px;
                padding: 5px 0;
                position: absolute;
                z-index: 1;
                bottom: 110%;
                left: 50%;
                margin-left: -60px;
            }

            .tooltiptext::after {
                content: "";
                position: absolute;
                top: 100%;
                left: 50%;
                margin-left: -5px;
                border-width: 5px;
                border-style: solid;
                border-color: black transparent transparent transparent;
            }

            &:hover .tooltiptext {
                visibility: visible;
            }
        `}
    >
      <div
        title={!titleAsTooltip ? title : ''}
        css={css`

        -webkit-line-clamp: ${lineClamp};
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        max-width: ${widthLarge};

        @media (max-width: 991.98px) {
          max-width: ${widthMedium};
        }

        @media (max-width: 480px) {
          max-width: ${widthSmall};
        }
      `}
      >
        {children}
      </div>
      {title && titleAsTooltip && <span className="tooltiptext">{title}</span>}
    </div>
  );
};

export default EllipsisTextMultiline;