import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

export interface CookieCategories {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  social: boolean;
}

export interface CookieConsent {
  categories: CookieCategories;
  timestamp: Date;
  version: string;
  consentGiven: boolean;
}

@Component({
  selector: 'app-cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss']
})
export class CookieBannerComponent implements OnInit {
  @Output() consentGiven = new EventEmitter<CookieConsent>();
  
  public showBanner = false;
  public showDetails = false;
  public cookieForm: FormGroup;
  public consentVersion = '1.0';

  public cookieCategories = [
    {
      key: 'essential',
      title: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you which amount to a request for services.',
      examples: ['Authentication', 'Security', 'Session management'],
      required: true,
      defaultEnabled: true
    },
    {
      key: 'functional',
      title: 'Functional Cookies',
      description: 'These cookies enhance the functionality of the website but are not essential. They may be set by us or by third party providers.',
      examples: ['Language preferences', 'Region selection', 'Accessibility settings'],
      required: false,
      defaultEnabled: true
    },
    {
      key: 'analytics',
      title: 'Analytics Cookies',
      description: 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.',
      examples: ['Google Analytics', 'Usage statistics', 'Performance monitoring'],
      required: false,
      defaultEnabled: false
    },
    {
      key: 'marketing',
      title: 'Marketing Cookies',
      description: 'These cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant adverts.',
      examples: ['Advertising targeting', 'Campaign tracking', 'Social media advertising'],
      required: false,
      defaultEnabled: false
    },
    {
      key: 'social',
      title: 'Social Media Cookies',
      description: 'These cookies are set by social media services that we have added to the site to enable you to share our content with your friends.',
      examples: ['Facebook', 'Twitter', 'LinkedIn sharing'],
      required: false,
      defaultEnabled: false
    }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkExistingConsent();
  }

  private initializeForm(): void {
    const formControls: any = {};
    
    this.cookieCategories.forEach(category => {
      formControls[category.key] = [category.defaultEnabled];
    });

    this.cookieForm = this.fb.group(formControls);

    // Essential cookies cannot be disabled
    this.cookieForm.get('essential')?.disable();
  }

  private checkExistingConsent(): void {
    // Check if user has already given consent
    const existingConsent = localStorage.getItem('vpoll-cookie-consent');
    
    if (!existingConsent) {
      // Show banner after a short delay to improve UX
      setTimeout(() => {
        this.showBanner = true;
      }, 1000);
    } else {
      try {
        const consent: CookieConsent = JSON.parse(existingConsent);
        // Check if consent version is current
        if (consent.version !== this.consentVersion) {
          // Show banner for updated consent
          this.showBanner = true;
        } else {
          // Apply existing consent
          this.applyConsent(consent);
        }
      } catch (error) {
        // Invalid consent data, show banner
        this.showBanner = true;
      }
    }
  }

  private applyConsent(consent: CookieConsent): void {
    // Update form with saved preferences
    Object.keys(consent.categories).forEach(key => {
      const control = this.cookieForm.get(key);
      if (control) {
        control.setValue(consent.categories[key as keyof CookieCategories]);
      }
    });

    // Apply cookie settings
    this.applyCookieSettings(consent.categories);
    
    // Emit consent for parent components
    this.consentGiven.emit(consent);
  }

  public acceptAll(): void {
    // Set all categories to true (except respect disabled state for essential)
    this.cookieCategories.forEach(category => {
      if (!category.required || category.key !== 'essential') {
        this.cookieForm.get(category.key)?.setValue(true);
      }
    });

    this.saveAndCloseConsent();
  }

  public acceptNecessary(): void {
    // Set only essential cookies
    this.cookieCategories.forEach(category => {
      this.cookieForm.get(category.key)?.setValue(category.required);
    });

    this.saveAndCloseConsent();
  }

  public saveCustomSettings(): void {
    this.saveAndCloseConsent();
  }

  private saveAndCloseConsent(): void {
    const categories: CookieCategories = {
      essential: true, // Always true
      functional: this.cookieForm.get('functional')?.value || false,
      analytics: this.cookieForm.get('analytics')?.value || false,
      marketing: this.cookieForm.get('marketing')?.value || false,
      social: this.cookieForm.get('social')?.value || false
    };

    const consent: CookieConsent = {
      categories,
      timestamp: new Date(),
      version: this.consentVersion,
      consentGiven: true
    };

    // Save to localStorage
    localStorage.setItem('vpoll-cookie-consent', JSON.stringify(consent));

    // Apply cookie settings
    this.applyCookieSettings(categories);

    // Hide banner
    this.showBanner = false;

    // Emit consent
    this.consentGiven.emit(consent);
  }

  private applyCookieSettings(categories: CookieCategories): void {
    // Apply cookie settings based on user preferences
    
    // Analytics cookies (e.g., Google Analytics)
    if (categories.analytics) {
      this.enableAnalyticsCookies();
    } else {
      this.disableAnalyticsCookies();
    }

    // Marketing cookies
    if (categories.marketing) {
      this.enableMarketingCookies();
    } else {
      this.disableMarketingCookies();
    }

    // Social media cookies
    if (categories.social) {
      this.enableSocialCookies();
    } else {
      this.disableSocialCookies();
    }

    // Functional cookies
    if (categories.functional) {
      this.enableFunctionalCookies();
    } else {
      this.disableFunctionalCookies();
    }
  }

  private enableAnalyticsCookies(): void {
    // Enable Google Analytics or other analytics tools
    console.log('Analytics cookies enabled');
    
    // Example: Load Google Analytics
    /*
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
    */
  }

  private disableAnalyticsCookies(): void {
    console.log('Analytics cookies disabled');
    
    // Example: Disable Google Analytics
    /*
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }
    */
  }

  private enableMarketingCookies(): void {
    console.log('Marketing cookies enabled');
    
    // Enable marketing/advertising cookies
    /*
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        'ad_storage': 'granted'
      });
    }
    */
  }

  private disableMarketingCookies(): void {
    console.log('Marketing cookies disabled');
    
    // Disable marketing/advertising cookies
    /*
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        'ad_storage': 'denied'
      });
    }
    */
  }

  private enableSocialCookies(): void {
    console.log('Social media cookies enabled');
    // Enable social media integrations
  }

  private disableSocialCookies(): void {
    console.log('Social media cookies disabled');
    // Disable social media integrations
  }

  private enableFunctionalCookies(): void {
    console.log('Functional cookies enabled');
    // Enable functional enhancements
  }

  private disableFunctionalCookies(): void {
    console.log('Functional cookies disabled');
    // Disable functional enhancements
  }

  public toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  public openCookiePolicy(): void {
    // Open cookie policy in new window
    const cookieWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    if (cookieWindow) {
      cookieWindow.document.write(this.getCookiePolicyHTML());
    }
  }

  private getCookiePolicyHTML(): string {
    return `
      <html>
        <head><title>Cookie Policy - VPoll</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Cookie Policy</h1>
          <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
          
          <h2>What are Cookies?</h2>
          <p>Cookies are small text files that are placed on your computer or mobile device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.</p>
          
          <h2>How We Use Cookies</h2>
          <p>We use cookies for several purposes:</p>
          
          ${this.cookieCategories.map(category => `
            <h3>${category.title}</h3>
            <p>${category.description}</p>
            <p><strong>Examples:</strong> ${category.examples.join(', ')}</p>
          `).join('')}
          
          <h2>Managing Your Cookie Preferences</h2>
          <p>You can manage your cookie preferences at any time by clicking on the "Cookie Settings" link in our footer, or by adjusting your browser settings.</p>
          
          <h2>Third-Party Cookies</h2>
          <p>Some cookies are set by third-party services that appear on our pages. We do not control these cookies and recommend you check the third-party websites for more information about their cookies and how to manage them.</p>
          
          <h2>Contact Us</h2>
          <p>If you have any questions about our use of cookies, please contact us at privacy@vpoll.com</p>
        </body>
      </html>
    `;
  }

  // Public method to reopen settings (called from footer or privacy settings)
  public static reopenCookieSettings(): void {
    const banner = document.querySelector('app-cookie-banner');
    if (banner) {
      (banner as any).showBanner = true;
      (banner as any).showDetails = true;
    }
  }
} 