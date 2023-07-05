import { Image } from '@chakra-ui/react'

export default function AboutUsComponent() {
  return (
    <div className="about" style={{ textAlign: "center" }}>
      <h2 style={{ color: "deepskyblue", fontSize: "24px" }}>
        Description
      </h2>
      <p>
        Puddle Finance is a decentralized fund platform on SUI network, where traders, businesses, or senior investors can create funds using Puddle Finance.
      </p>
      <p>
        Users can entrust their assets to trusted funds for investment, and when the funds generate profits, they are shared with the investors.
      </p>

      <h2 style={{ color: "gold", fontSize: "24px" }}>
        Origin of Project Name
      </h2>
      <p>
        Our project is a fund platform that will allow a lot of money to flow in.
      </p>
      <p>
        SUI's symbol is a water droplet, when a large amounts of SUI come together, they form a puddle.
      </p>
      <p>
        Therefore, this is why we are called “Puddle Finance”.
      </p>

      <Image borderRadius='full'
  src='https://i.imgur.com/id7Mdg4.jpeg'
  />

    </div>
  );
}