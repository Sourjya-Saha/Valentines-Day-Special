import Flower from '../flower/Flower';

export default function Flower4Page() {
  const photos = [
    { src: '/images/img16.jpeg', caption: 'Durga Pujoo Part 1' },
    { src: '/images/img17.jpeg', caption: 'Durga Pujoo Part 2' },
    { src: '/images/img18.jpeg', caption: 'Durga Pujoo Part 3' },
    { src: '/images/img15.jpeg', caption: 'Holiii' },
    { src: '/images/img20.jpeg', caption: 'Diwaliii Part 1' },
    { src: '/images/img19.jpeg', caption: 'Diwaliii Part 2' },
    { src: '/images/img4.jpeg', caption: 'Christmas' },
  ];

  return <Flower photos={photos} title="Festivals" />;
}