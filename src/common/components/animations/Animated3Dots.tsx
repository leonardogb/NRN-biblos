import React from 'react';

export type Props = {
  /**
   * Color of the dots.
   *
   * @default white
   */
  fill?: string;

  /**
   * Class to add
   * 
   * @default ''
   */
  className?: string;

  /**
   * width
   * 
   * @default 20px
   */
  width?: string;

  /**
   * Margin-left
   * 
   * @default 0
   */
  marginLeft?: string
};

/**
 * An animated composant featuring 3 animated dots "...".
 *
 * Each dot is animated separately, in alternation.
 * Requires animate.css library.
 *
 * @see https://animate.style
 */
const Animated3Dots = (props: Props): JSX.Element => {
  
  const {
    fill = 'white',
    className = '',
    width = '20px',
    marginLeft = 0
  } = props;

  return (
    <svg
      id="AnimatedBubble_svg__Calque_1"
      x={0}
      y={0}
      viewBox="0 0 19 5"
      width={width}
      style={{
        overflow: 'visible',
        paddingTop: 5,
        marginLeft: marginLeft,
      }}
      xmlSpace="preserve"
      fill={'white'}
      className={className}
      {...props}
    >
      <circle
        className="animate__animated animate__fadeIn animate__infinite delay-200ms"
        cx={2.783}
        cy={2.796}
        r={2.153}
      />
      <circle
        className="animate__animated animate__fadeIn animate__infinite delay-400ms"
        cx={9.576}
        cy={2.796}
        r={2.153}
      />
      <circle
        className="animate__animated animate__fadeIn animate__infinite delay-600ms"
        cx={16.369}
        cy={2.796}
        r={2.153}
      />
    </svg>
  );
};

export default Animated3Dots;
