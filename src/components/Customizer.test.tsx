import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Customizer from './Customizer';
import { ResumeStyles, ResumeMetadata } from '@/lib/db';

const defaultStyles: ResumeStyles = {
  h1Color: '#1f2937',
  h2Color: '#374151',
  h3Color: '#4b5563',
  textColor: '#4b5563',
  h1Size: '24',
  h2Size: '18',
  h3Size: '14',
  textSize: '12',
  fontFamily: "'Inter', sans-serif",
  padding: '2rem',
  margin: '1rem',
  lineHeight: '1.6',
  textAlign: 'left',
  listColumns: 1,
  pageSize: 'A4',
  template: 'classic',
  listSpacing: '0.25rem',
  sectionSpacing: '1.5rem',
};

describe('Customizer Component - Metadata Section', () => {
  it('renders the PDF Metadata section and its input fields', () => {
    const onChange = vi.fn();
    const onMetadataChange = vi.fn();

    render(
      <Customizer
        styles={defaultStyles}
        onChange={onChange}
        metadata={{
          title: 'My Custom PDF Title',
          author: 'Rohit Chouhan',
          subject: 'Full Stack Engineer',
          keywords: 'React, Node, TypeScript',
          creator: 'mdesume',
        }}
        onMetadataChange={onMetadataChange}
        resumeTitle="Original Resume Title"
      />
    );

    // Section title
    expect(screen.getByText(/PDF Metadata/i)).toBeInTheDocument();

    // Input fields
    const titleInput = screen.getByDisplayValue('My Custom PDF Title');
    const authorInput = screen.getByDisplayValue('Rohit Chouhan');
    const subjectInput = screen.getByDisplayValue('Full Stack Engineer');
    const keywordsInput = screen.getByDisplayValue('React, Node, TypeScript');
    const creatorInput = screen.getByDisplayValue('mdesume');

    expect(titleInput).toBeInTheDocument();
    expect(authorInput).toBeInTheDocument();
    expect(subjectInput).toBeInTheDocument();
    expect(keywordsInput).toBeInTheDocument();
    expect(creatorInput).toBeInTheDocument();
  });

  it('calls onMetadataChange when inputs are edited', () => {
    const onChange = vi.fn();
    const onMetadataChange = vi.fn();

    const initialMetadata: ResumeMetadata = {
      title: 'Initial Title',
      author: 'Initial Author',
      subject: '',
      keywords: '',
      creator: 'mdesume',
    };

    render(
      <Customizer
        styles={defaultStyles}
        onChange={onChange}
        metadata={initialMetadata}
        onMetadataChange={onMetadataChange}
      />
    );

    const authorInput = screen.getByDisplayValue('Initial Author');
    fireEvent.change(authorInput, { target: { value: 'New Author Name' } });

    expect(onMetadataChange).toHaveBeenCalledWith({
      title: 'Initial Title',
      author: 'New Author Name',
      subject: '',
      keywords: '',
      creator: 'mdesume',
    });
  });

  it('displays resumeTitle as placeholder for Document Title when title is empty', () => {
    const onChange = vi.fn();
    const onMetadataChange = vi.fn();

    render(
      <Customizer
        styles={defaultStyles}
        onChange={onChange}
        metadata={{
          title: '',
          author: '',
          subject: '',
          keywords: '',
          creator: 'mdesume',
        }}
        onMetadataChange={onMetadataChange}
        resumeTitle="Rohit - Senior Resume"
      />
    );

    const titleInput = screen.getByPlaceholderText('Rohit - Senior Resume');
    expect(titleInput).toBeInTheDocument();
  });
});
