import Flower from '../flower/Flower';

export default function Flower2Page() {
  const photos = [
    { src: '/images/img.jpeg', caption: '11th Best Part 1' },
    { src: '/images/img7.jpeg', caption: '12th Best Part 1' },
    { src: '/images/img8.jpeg', caption: '12th Best Part 2' },
    { src: '/images/img9.jpeg', caption: 'The Best' },
  ];

  return <Flower photos={photos} title="School Days" />;
}