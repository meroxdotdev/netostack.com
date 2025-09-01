export const cidrContent = {
  title: "CIDR Notation Explained",
  description: "Complete guide to CIDR notation - what it is, why it replaced IP classes, and how to read network prefixes.",
  
  sections: {
    whatIs: {
      title: "What is CIDR?",
      content: `CIDR (Classless Inter-Domain Routing) is a method for describing IP networks using a slash followed by a number. The number after the slash tells you how many bits are used for the network portion of the address.

For example, in 192.168.1.0/24, the "/24" means the first 24 bits identify the network, and the remaining 8 bits identify individual hosts within that network.`
    },

    whyReplaced: {
      title: "Why CIDR Replaced IP Classes",
      content: `The old class system (Class A, B, C) was too rigid and wasteful. It only allowed networks of fixed sizes:

- Class A: 16 million addresses (way too big for most needs)  
- Class B: 65,536 addresses (often too big)
- Class C: 256 addresses (often too small)

CIDR lets you create networks of any size by choosing exactly how many network bits you need.`
    },

    howToRead: {
      title: "How to Read CIDR Notation",
      content: `The number after the slash is the "prefix length" - it counts the network bits from left to right:

- /8 = 8 network bits (24 host bits)
- /16 = 16 network bits (16 host bits)  
- /24 = 24 network bits (8 host bits)
- /30 = 30 network bits (2 host bits)`
    }
  },

  examples: [
    {
      cidr: "192.168.0.0/24",
      description: "Home network - 254 usable addresses",
      hosts: "254 hosts"
    },
    {
      cidr: "10.0.0.0/8", 
      description: "Large private network - 16 million addresses",
      hosts: "16,777,214 hosts"
    },
    {
      cidr: "172.16.0.0/12",
      description: "Medium private network - 1 million addresses", 
      hosts: "1,048,574 hosts"
    },
    {
      cidr: "2001:db8::/32",
      description: "IPv6 network - massive address space",
      hosts: "2^96 addresses"
    }
  ],

  prefixTable: [
    { prefix: "/8", mask: "255.0.0.0", hosts: "16,777,214", typical: "ISP allocation" },
    { prefix: "/16", mask: "255.255.0.0", hosts: "65,534", typical: "Large enterprise" },
    { prefix: "/20", mask: "255.255.240.0", hosts: "4,094", typical: "Medium business" },
    { prefix: "/24", mask: "255.255.255.0", hosts: "254", typical: "Small office/home" },
    { prefix: "/25", mask: "255.255.255.128", hosts: "126", typical: "Small subnet" },
    { prefix: "/26", mask: "255.255.255.192", hosts: "62", typical: "Point-to-point" },
    { prefix: "/30", mask: "255.255.255.252", hosts: "2", typical: "Router links" },
    { prefix: "/32", mask: "255.255.255.255", hosts: "1", typical: "Single host" }
  ],

  keyPoints: [
    "Smaller prefix numbers = bigger networks (more hosts)",
    "Larger prefix numbers = smaller networks (fewer hosts)",
    "/24 is the most common size for small networks",
    "IPv6 commonly uses /64 for end-user networks",
    "CIDR allows efficient use of IP address space"
  ]
};