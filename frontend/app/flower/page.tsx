import Flower from './Flower';

export default function FlowerPage() {
  const photos = [
    { src: '/images/img1.jpeg', caption: '2021' },
    { src: '/images/img2.jpeg', caption: '2022' },
    { src: '/images/img3.jpeg', caption: '2023' },
    { src: '/images/img4.jpeg', caption: '2024' },
    { src: '/images/img5.jpeg', caption: '2025' },
    { src: '/images/img6.jpeg', caption: '2026' },
  ];

  return <Flower photos={photos} title="2021 - ∞" />;
}