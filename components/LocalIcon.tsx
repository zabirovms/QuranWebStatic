'use client';

import { useState, useEffect } from 'react';

interface LocalIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

// Cache for loaded SVGs
const svgCache = new Map<string, string>();

export default function LocalIcon({ name, className, style }: LocalIconProps) {
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    // Check cache first
    if (svgCache.has(name)) {
      setSvgContent(svgCache.get(name)!);
      return;
    }

    // Load SVG from public folder
    fetch(`/icons/ionicons/${name}.svg`)
      .then((res) => {
        if (!res.ok) throw new Error('Icon not found');
        return res.text();
      })
      .then((text) => {
        // Cache the SVG content
        svgCache.set(name, text);
        setSvgContent(text);
      })
      .catch(() => {
        // Icon not found, leave empty
        svgCache.set(name, '');
      });
  }, [name]);

  if (!svgContent) {
    return <span style={{ display: 'inline-block', width: '20px', height: '20px' }} />;
  }

  // Parse and modify SVG
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgElement = svgDoc.querySelector('svg');

  if (!svgElement) {
    return null;
  }

  // Set size
  svgElement.setAttribute('width', '20');
  svgElement.setAttribute('height', '20');
  
  // Set fill to currentColor for theme compatibility
  svgElement.setAttribute('fill', 'currentColor');
  
  // Remove any existing fill/stroke from all paths and groups, and set fill to currentColor
  // This ensures all icons are filled consistently
  svgElement.querySelectorAll('path').forEach((path) => {
    // Force fill to currentColor, overriding any existing fill (including fill="none")
    path.setAttribute('fill', 'currentColor');
    // Remove stroke attributes that might interfere with fill
    path.removeAttribute('stroke');
    path.removeAttribute('stroke-width');
    path.removeAttribute('stroke-linecap');
    path.removeAttribute('stroke-linejoin');
  });
  
  // Also handle groups - set fill and remove stroke attributes
  svgElement.querySelectorAll('g').forEach((group) => {
    group.setAttribute('fill', 'currentColor');
    group.removeAttribute('stroke');
    group.removeAttribute('stroke-width');
    group.removeAttribute('stroke-linecap');
    group.removeAttribute('stroke-linejoin');
  });
  
  // Ensure the SVG itself doesn't have fill="none"
  if (svgElement.getAttribute('fill') === 'none') {
    svgElement.setAttribute('fill', 'currentColor');
  }

  if (className) {
    svgElement.setAttribute('class', className);
  }

  const combinedStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    ...style,
  };

  return (
    <span
      dangerouslySetInnerHTML={{ __html: svgElement.outerHTML }}
      style={combinedStyle}
    />
  );
}
