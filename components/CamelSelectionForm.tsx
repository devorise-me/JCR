import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface Camel {
  id: string;
  name: string;
  // Add other camel fields if needed
}

const CamelSelectionForm: React.FC = () => {
  const [camels, setCamels] = useState<Camel[]>([]);
  const [selectedCamels, setSelectedCamels] = useState<{ [key: string]: number }>({}); // camelId: position
  const [error, setError] = useState<string | null>(null);

  // Fetch camels on component mount
  useEffect(() => {
    const fetchCamels = async () => {
      try {
        const response = await fetch('/api/camels');
        if (!response.ok) {
          throw new Error('Failed to fetch camels');
        }
        const data = await response.json();
        setCamels(data);
      } catch (err) {
        setError('Error fetching camels');
      }
    };

    fetchCamels();
  }, []);

  // Handle checkbox change
  const handleCheckboxChange = (camelId: string, position: number) => {
    setSelectedCamels((prev) => ({
      ...prev,
      [camelId]: position,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare the data to be sent to the server
    const results = Object.entries(selectedCamels).map(([camelId, position]) => ({
      camelId,
      position,
    }));

    try {
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(results),
      });

      if (!response.ok) {
        throw new Error('Failed to submit results');
      }

      // Handle successful submission
      alert('Results submitted successfully!');
    } catch (err) {
      setError('Error submitting results');
    }
  };

  return (
    <div className="p-4">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        {camels.map((camel) => (
          <div key={camel.id} className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                value={camel.id}
                onChange={(e) => {
                  if (e.target.checked) {
                    const position = prompt(`Enter position for ${camel.name}`);
                    if (position) {
                      handleCheckboxChange(camel.id, parseInt(position, 10));
                    }
                  } else {
                    setSelectedCamels((prev) => {
                      const newState = { ...prev };
                      delete newState[camel.id];
                      return newState;
                    });
                  }
                }}
                className="mr-2"
              />
              {camel.name}
            </label>
          </div>
        ))}
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
};

export default CamelSelectionForm;
