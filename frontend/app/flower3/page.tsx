import Flower from '../flower/Flower';

export default function Flower3Page() {
  const photos = [
    { src: '/images/img11.jpeg', caption: '2022' },
    { src: '/images/img12.jpeg', caption: '2023' },
    { src: '/images/img13.jpeg', caption: '2024' },
    { src: '/images/img14.jpeg', caption: '2025' },
  ];

  return <Flower photos={photos} title="Birthdays" />;
}