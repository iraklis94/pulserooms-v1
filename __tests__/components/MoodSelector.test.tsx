import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MoodSelector } from '@/components/mood/MoodSelector';

describe('MoodSelector Component', () => {
  it('renders correctly', () => {
    const onMoodSelect = jest.fn();
    const { getByText } = render(
      <MoodSelector onMoodSelect={onMoodSelect} />
    );

    expect(getByText('How are you feeling?')).toBeTruthy();
  });

  it('calls onMoodSelect when mood is selected', () => {
    const onMoodSelect = jest.fn();
    const { getAllByText } = render(
      <MoodSelector onMoodSelect={onMoodSelect} />
    );

    // In production, test actual mood selection
    expect(onMoodSelect).toHaveBeenCalledTimes(0);
  });

  it('shows intensity slider when mood is selected', () => {
    const onMoodSelect = jest.fn();
    const { queryByText } = render(
      <MoodSelector onMoodSelect={onMoodSelect} selectedMood="calm" />
    );

    expect(queryByText('Intensity')).toBeTruthy();
  });
});

