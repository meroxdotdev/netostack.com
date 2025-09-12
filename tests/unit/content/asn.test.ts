import { describe, it, expect } from 'vitest';
import { asnContent } from '../../../src/lib/content/asn';

describe('ASN content', () => {
  it('has valid structure', () => {
    expect(asnContent).toBeDefined();
    expect(asnContent.title).toBe("What is an ASN?");
    expect(asnContent.description).toContain("Autonomous System Numbers");
    expect(asnContent.sections).toBeDefined();
    expect(asnContent.asnTypes).toBeInstanceOf(Array);
    expect(asnContent.bgpBasics).toBeDefined();
  });

  it('explains Autonomous Systems clearly', () => {
    const overview = asnContent.sections.overview;
    expect(overview.title).toBe("What is an Autonomous System (AS)?");
    expect(overview.content).toContain("collection of IP networks and routers");
    expect(overview.content).toContain("common routing policy");
    expect(overview.content).toContain("ISP");
    expect(overview.content).toContain("university");
  });

  it('defines ASN concept correctly', () => {
    const asn = asnContent.sections.asn;
    expect(asn.title).toBe("ASN (Autonomous System Number)");
    expect(asn.content).toContain("unique numbers");
    expect(asn.content).toContain("postal codes");
    expect(asn.content).toContain("Regional Internet Registries");
    expect(asn.content).toContain("Border Gateway Protocol");
  });

  it('categorizes ASN types correctly', () => {
    expect(asnContent.asnTypes).toHaveLength(3);
    
    const types = asnContent.asnTypes;
    const publicASN = types.find(t => t.name === "16-bit Public ASNs");
    const privateASN = types.find(t => t.name === "16-bit Private ASNs");
    const extendedASN = types.find(t => t.name === "32-bit Public ASNs");
    
    expect(publicASN).toBeDefined();
    expect(publicASN?.range).toBe("1 - 64,511");
    expect(publicASN?.examples).toContain("AS15169 - Google");
    
    expect(privateASN).toBeDefined();
    expect(privateASN?.range).toBe("64,512 - 65,534");
    expect(privateASN?.usage).toContain("private use");
    
    expect(extendedASN).toBeDefined();
    expect(extendedASN?.range).toBe("65,536 - 4,199,999,999");
    expect(extendedASN?.description).toContain("Extended format");
  });

  it('covers BGP fundamentals', () => {
    const bgp = asnContent.bgpBasics;
    expect(bgp.title).toBe("BGP (Border Gateway Protocol) Basics");
    expect(bgp.description).toContain("routing protocol");
    expect(bgp.concepts).toBeInstanceOf(Array);
    expect(bgp.concepts.length).toBeGreaterThan(3);
    
    const concepts = bgp.concepts.map(c => c.term);
    expect(concepts).toContain("AS Path");
    expect(concepts).toContain("Peering");
    expect(concepts).toContain("Prefix Announcement");
  });

  it('includes practical examples', () => {
    expect(asnContent.practicalExamples).toBeDefined();
    expect(asnContent.practicalExamples.lookupTools).toBeInstanceOf(Array);
    expect(asnContent.practicalExamples.commonASNs).toBeInstanceOf(Array);
    
    const tools = asnContent.practicalExamples.lookupTools;
    expect(tools.some(tool => tool.name.includes("whois"))).toBe(true);
    
    const commonASNs = asnContent.practicalExamples.commonASNs;
    expect(commonASNs.some(asn => asn.asn.includes("Google"))).toBe(true);
  });

  it('explains real-world relevance', () => {
    expect(asnContent.realWorldRelevance).toBeDefined();
    expect(asnContent.realWorldRelevance.useCases).toBeInstanceOf(Array);
    expect(asnContent.realWorldRelevance.useCases.length).toBeGreaterThan(2);
    
    const useCases = asnContent.realWorldRelevance.useCases;
    expect(useCases.some(uc => uc.includes("routing policies"))).toBe(true);
    expect(useCases.some(uc => uc.includes("traffic analysis"))).toBe(true);
  });

  it('provides troubleshooting guidance', () => {
    expect(asnContent.troubleshooting).toBeDefined();
    expect(asnContent.troubleshooting.commonIssues).toBeInstanceOf(Array);
    
    const issues = asnContent.troubleshooting.commonIssues;
    expect(issues.some(issue => issue.problem.includes("hijacking"))).toBe(true);
  });

  it('validates data structure consistency', () => {
    // Check ASN types structure
    asnContent.asnTypes.forEach(type => {
      expect(type).toHaveProperty('range');
      expect(type).toHaveProperty('name');
      expect(type).toHaveProperty('description');
      expect(type).toHaveProperty('usage');
      expect(type).toHaveProperty('examples');
      expect(type.examples).toBeInstanceOf(Array);
    });

    // Check BGP concepts structure  
    asnContent.bgpBasics.concepts.forEach(concept => {
      expect(concept).toHaveProperty('term');
      expect(concept).toHaveProperty('definition');
      expect(typeof concept.term).toBe('string');
      expect(typeof concept.definition).toBe('string');
    });
  });

  it('includes well-known ASN examples', () => {
    const content = JSON.stringify(asnContent);
    expect(content).toContain("Google");
    expect(content).toContain("Facebook");
    expect(content).toContain("AT&T");
    expect(content).toContain("AS15169");
    expect(content).toContain("AS7018");
  });

  it('emphasizes practical network operations', () => {
    const content = JSON.stringify(asnContent);
    expect(content).toContain("routing");
    expect(content).toContain("BGP");
    expect(content).toContain("peering");
    expect(content).toContain("internet");
    expect(content).toContain("prefix");
    expect(content).toContain("announcement");
    expect(content).not.toContain("password");
    expect(content).not.toContain("malicious");
  });

  it('covers ASN ranges comprehensively', () => {
    const ranges = asnContent.asnTypes.map(t => t.range);
    
    // Should cover the full ASN space
    expect(ranges.some(r => r.includes("1 - 64,511"))).toBe(true);
    expect(ranges.some(r => r.includes("64,512 - 65,534"))).toBe(true);
    expect(ranges.some(r => r.includes("65,536"))).toBe(true);
    
    // Check range boundaries are properly defined
    asnContent.asnTypes.forEach(type => {
      if (type.name.includes("Private")) {
        expect(type.description).toContain("private use");
        expect(type.usage).toContain("private");
      }
    });
  });
});