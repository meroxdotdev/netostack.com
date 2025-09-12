import { test, expect } from '@playwright/test';

test.describe('Core calculation accuracy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('IPv4 subnet calculator produces accurate results', async ({ page }) => {
    // Navigate to subnet calculator
    await page.goto('/subnetting/ipv4-subnet-calculator');
    
    // Input a known subnet
    await page.getByLabel(/ip address/i).fill('192.168.1.100');
    await page.getByLabel(/cidr prefix/i).fill('24');
    
    // Submit calculation
    await page.getByRole('button', { name: /calculate/i }).click();
    
    // Verify critical calculation results
    await expect(page.getByText('192.168.1.0')).toBeVisible(); // Network address
    await expect(page.getByText('192.168.1.255')).toBeVisible(); // Broadcast
    await expect(page.getByText('192.168.1.1')).toBeVisible(); // First host
    await expect(page.getByText('192.168.1.254')).toBeVisible(); // Last host
    await expect(page.getByText('254')).toBeVisible(); // Host count
  });

  test('CIDR conversion tools produce accurate results', async ({ page }) => {
    // Test CIDR to subnet mask conversion
    await page.goto('/cidr/mask-converter/cidr-to-subnet-mask');
    
    await page.getByLabel(/cidr/i).fill('24');
    await page.getByRole('button', { name: /convert/i }).click();
    
    // Verify /24 = 255.255.255.0
    await expect(page.getByText('255.255.255.0')).toBeVisible();
    
    // Test edge case /30
    await page.getByLabel(/cidr/i).fill('30');
    await page.getByRole('button', { name: /convert/i }).click();
    
    await expect(page.getByText('255.255.255.252')).toBeVisible();
  });

  test('IP format conversions are accurate', async ({ page }) => {
    await page.goto('/ip-address-convertor/representations');
    
    // Test a known IP conversion
    await page.getByLabel(/ip address/i).fill('192.168.1.1');
    await page.getByRole('button', { name: /convert/i }).click();
    
    // Check decimal representation
    await expect(page.getByText('3232235777')).toBeVisible();
    
    // Check binary representation
    await expect(page.getByText('11000000.10101000.00000001.00000001')).toBeVisible();
  });

  test('VLSM calculations handle real network scenarios', async ({ page }) => {
    await page.goto('/subnetting/vlsm-calculator');
    
    // Set up network
    await page.getByLabel(/network/i).fill('192.168.1.0');
    await page.getByLabel(/cidr/i).fill('24');
    
    // Add subnet requirements
    await page.getByLabel(/name/i).first().fill('Sales');
    await page.getByLabel(/hosts needed/i).first().fill('100');
    
    await page.getByRole('button', { name: /add subnet/i }).click();
    
    await page.getByLabel(/name/i).last().fill('IT');
    await page.getByLabel(/hosts needed/i).last().fill('25');
    
    // Calculate VLSM
    await page.getByRole('button', { name: /calculate vlsm/i }).click();
    
    // Verify largest subnet comes first and gets /25
    await expect(page.getByText('Sales')).toBeVisible();
    await expect(page.getByText('/25')).toBeVisible();
    await expect(page.getByText('126')).toBeVisible(); // Host count for /25
  });

  test('handles edge cases correctly', async ({ page }) => {
    // Test /31 subnet (point-to-point)
    await page.goto('/subnetting/ipv4-subnet-calculator');
    
    await page.getByLabel(/ip address/i).fill('192.168.1.0');
    await page.getByLabel(/cidr prefix/i).fill('31');
    
    await page.getByRole('button', { name: /calculate/i }).click();
    
    // /31 should have 2 usable hosts (no network/broadcast)
    await expect(page.getByText('2')).toBeVisible(); // Host count
    
    // Test /32 subnet (single host)
    await page.getByLabel(/cidr prefix/i).fill('32');
    await page.getByRole('button', { name: /calculate/i }).click();
    
    await expect(page.getByText('1')).toBeVisible(); // Single host
  });

  test('supernet calculator aggregates correctly', async ({ page }) => {
    await page.goto('/subnetting/supernet-calculator');
    
    // Enter adjacent networks that should aggregate
    await page.getByRole('textbox').fill(`192.168.0.0/24
192.168.1.0/24
192.168.2.0/24
192.168.3.0/24`);
    
    await page.getByRole('button', { name: /calculate/i }).click();
    
    // Should aggregate to /22
    await expect(page.getByText('192.168.0.0/22')).toBeVisible();
  });

  test('maintains calculation accuracy under stress', async ({ page }) => {
    // Test with large networks
    await page.goto('/subnetting/ipv4-subnet-calculator');
    
    await page.getByLabel(/ip address/i).fill('10.0.0.0');
    await page.getByLabel(/cidr prefix/i).fill('8');
    
    await page.getByRole('button', { name: /calculate/i }).click();
    
    // Should handle /8 (16 million addresses) correctly
    await expect(page.getByText('16777214')).toBeVisible(); // Host count for /8
    await expect(page.getByText('10.255.255.255')).toBeVisible(); // Broadcast
  });

  test('validates input and shows appropriate errors', async ({ page }) => {
    await page.goto('/subnetting/ipv4-subnet-calculator');
    
    // Test invalid IP
    await page.getByLabel(/ip address/i).fill('256.256.256.256');
    await page.getByRole('button', { name: /calculate/i }).click();
    
    // Should show validation error
    await expect(page.getByText(/invalid|error/i)).toBeVisible();
    
    // Test invalid CIDR
    await page.getByLabel(/ip address/i).fill('192.168.1.0');
    await page.getByLabel(/cidr prefix/i).fill('35');
    await page.getByRole('button', { name: /calculate/i }).click();
    
    await expect(page.getByText(/invalid|error/i)).toBeVisible();
  });
});