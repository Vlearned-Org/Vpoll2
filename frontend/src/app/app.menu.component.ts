import { Component, OnInit } from "@angular/core";
import { AppMainComponent } from "./app.main.component";
import { IdentityService } from "./shared/security/services/identity.service";

@Component({
  selector: "app-menu",
  template: `
    <div class="layout-menu-container">
      <ul class="layout-menu" role="menu" (keydown)="onKeydown($event)">
        <li
          app-menu
          class="layout-menuitem-category"
          *ngFor="let item of model; let i = index"
          [item]="item"
          [index]="i"
          [root]="true"
          role="none"
        >
          <div class="layout-menuitem-root-text" [attr.aria-label]="item.label">
            {{ item.label }}
          </div>
          <ul role="menu">
            <li
              app-menuitem
              *ngFor="let child of item.items"
              [item]="child"
              [index]="i"
              role="none"
            ></li>
          </ul>
        </li>
      </ul>
    </div>
  `,
})
export class AppMenuComponent implements OnInit {
  model: any[];

  constructor(
    public appMain: AppMainComponent,
    private identity: IdentityService,
  ) {}

  ngOnInit() {
    this.model = [
      {
        items: [],
      },
      // {
      //   label: 'UI Components',
      //   items: [
      //     {
      //       label: 'Dashboard',
      //       icon: 'pi pi-fw pi-home',
      //       routerLink: ['/admin/dashboard'],
      //     },
      //     {
      //       label: 'Form Layout',
      //       icon: 'pi pi-fw pi-id-card',
      //       routerLink: ['/uikit/formlayout'],
      //     },
      //     {
      //       label: 'Input',
      //       icon: 'pi pi-fw pi-check-square',
      //       routerLink: ['/uikit/input'],
      //     },
      //     {
      //       label: 'Float Label',
      //       icon: 'pi pi-fw pi-bookmark',
      //       routerLink: ['/uikit/floatlabel'],
      //     },
      //     {
      //       label: 'Invalid State',
      //       icon: 'pi pi-fw pi-exclamation-circle',
      //       routerLink: ['/uikit/invalidstate'],
      //     },
      //     {
      //       label: 'Button',
      //       icon: 'pi pi-fw pi-mobile',
      //       routerLink: ['/uikit/button'],
      //       class: 'rotated-icon',
      //     },
      //     {
      //       label: 'Table',
      //       icon: 'pi pi-fw pi-table',
      //       routerLink: ['/uikit/table'],
      //     },
      //     {
      //       label: 'List',
      //       icon: 'pi pi-fw pi-list',
      //       routerLink: ['/uikit/list'],
      //     },
      //     {
      //       label: 'Tree',
      //       icon: 'pi pi-fw pi-share-alt',
      //       routerLink: ['/uikit/tree'],
      //     },
      //     {
      //       label: 'Panel',
      //       icon: 'pi pi-fw pi-tablet',
      //       routerLink: ['/uikit/panel'],
      //     },

      //     {
      //       label: 'Message',
      //       icon: 'pi pi-fw pi-comment',
      //       routerLink: ['/uikit/message'],
      //     },
      //     {
      //       label: 'File',
      //       icon: 'pi pi-fw pi-file',
      //       routerLink: ['/uikit/file'],
      //     },
      //     {
      //       label: 'Chart',
      //       icon: 'pi pi-fw pi-chart-bar',
      //       routerLink: ['/uikit/charts'],
      //     },
      //     {
      //       label: 'Misc',
      //       icon: 'pi pi-fw pi-circle',
      //       routerLink: ['/uikit/misc'],
      //     },
      //   ],
      // },
      // {
      //   label: 'Prime Blocks',
      //   items: [
      //     {
      //       label: 'Free Blocks',
      //       icon: 'pi pi-fw pi-eye',
      //       routerLink: ['/uikit/blocks'],
      //       badge: 'NEW',
      //     },
      //     {
      //       label: 'All Blocks',
      //       icon: 'pi pi-fw pi-globe',
      //       url: ['https://www.primefaces.org/primeblocks-ng'],
      //       target: '_blank',
      //     },
      //   ],
      // },
      // {
      //   label: 'Utilities',
      //   items: [
      //     {
      //       label: 'PrimeIcons',
      //       icon: 'pi pi-fw pi-prime',
      //       routerLink: ['/uikit/icons'],
      //     },
      //     {
      //       label: 'PrimeFlex',
      //       icon: 'pi pi-fw pi-desktop',
      //       url: ['https://www.primefaces.org/primeflex/'],
      //       target: '_blank',
      //     },
      //   ],
      // },
      // {
      //   label: 'Pages',
      //   items: [
      //     {
      //       label: 'Crud',
      //       icon: 'pi pi-fw pi-user-edit',
      //       routerLink: ['/pages/crud'],
      //     },
      //     {
      //       label: 'Timeline',
      //       icon: 'pi pi-fw pi-calendar',
      //       routerLink: ['/pages/timeline'],
      //     },
      //     {
      //       label: 'Landing',
      //       icon: 'pi pi-fw pi-globe',
      //       routerLink: ['pages/landing'],
      //     },
      //     {
      //       label: 'Login',
      //       icon: 'pi pi-fw pi-sign-in',
      //       routerLink: ['pages/login'],
      //     },
      //     {
      //       label: 'Error',
      //       icon: 'pi pi-fw pi-times-circle',
      //       routerLink: ['/pages/error'],
      //     },
      //     {
      //       label: 'Not Found',
      //       icon: 'pi pi-fw pi-exclamation-circle',
      //       routerLink: ['/pages/notfound'],
      //     },
      //     {
      //       label: 'Access Denied',
      //       icon: 'pi pi-fw pi-lock',
      //       routerLink: ['/pages/access'],
      //     },
      //     {
      //       label: 'Empty',
      //       icon: 'pi pi-fw pi-circle',
      //       routerLink: ['/pages/empty'],
      //     },
      //   ],
      // },
      // {
      //   label: 'Hierarchy',
      //   items: [
      //     {
      //       label: 'Submenu 1',
      //       icon: 'pi pi-fw pi-bookmark',
      //       items: [
      //         {
      //           label: 'Submenu 1.1',
      //           icon: 'pi pi-fw pi-bookmark',
      //           items: [
      //             { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
      //             { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
      //             { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' },
      //           ],
      //         },
      //         {
      //           label: 'Submenu 1.2',
      //           icon: 'pi pi-fw pi-bookmark',
      //           items: [
      //             { label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' },
      //           ],
      //         },
      //       ],
      //     },
      //     {
      //       label: 'Submenu 2',
      //       icon: 'pi pi-fw pi-bookmark',
      //       items: [
      //         {
      //           label: 'Submenu 2.1',
      //           icon: 'pi pi-fw pi-bookmark',
      //           items: [
      //             { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
      //             { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' },
      //           ],
      //         },
      //         {
      //           label: 'Submenu 2.2',
      //           icon: 'pi pi-fw pi-bookmark',
      //           items: [
      //             { label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' },
      //           ],
      //         },
      //       ],
      //     },
      //   ],
      // },
      // {
      //   label: 'Get Started',
      //   items: [
      //     {
      //       label: 'Documentation',
      //       icon: 'pi pi-fw pi-question',
      //       routerLink: ['/documentation'],
      //     },
      //     {
      //       label: 'View Source',
      //       icon: 'pi pi-fw pi-search',
      //       url: ['https://github.com/primefaces/sakai-ng'],
      //       target: '_blank',
      //     },
      //   ],
      // },
    ];

    if (this.identity.isCommonUser) {
      this.model[0].items = [
        {
          label: "Home",
          icon: "pi pi-fw pi-list",
          routerLink: ["/home"],
        },
        {
          label: "Events",
          icon: "pi pi-fw pi-book",
          routerLink: ["/events"],
        },
        {
          label: "Privacy Settings",
          icon: "pi pi-fw pi-shield",
          routerLink: ["/privacy-settings"],
        },
      ];
    } else if (this.identity.isSystem) {
      this.model[0].items = [
        {
          label: "Companies",
          icon: "pi pi-fw pi-list",
          routerLink: ["company-list"],
        },
        {
          label: "Users",
          icon: "pi pi-fw pi-users",
          routerLink: ["user-list"],
        },
        {
          label: "Legacy Users",
          icon: "pi pi-fw pi-user-plus",
          routerLink: ["legacy-users"],
        },
      ];
    } else if (this.identity.isCompanySystem) {
      this.model[0].items = [
        {
          label: "Company Profile",
          icon: "pi pi-fw pi-book",
          routerLink: ["company/profile"],
        },
        {
          label: "User Access",
          icon: "pi pi-fw pi-book",
          routerLink: ["company/users"],
        },
        {
          label: "Events",
          icon: "pi pi-fw pi-book",
          routerLink: ["company/events"],
        },
        {
          label: "Privacy Settings",
          icon: "pi pi-fw pi-shield",
          routerLink: ["/privacy-settings"],
        },
      ];
    } else {
      this.model[0].items = [
        {
          label: "Company Profile",
          icon: "pi pi-fw pi-book",
          routerLink: ["company/profile"],
        },
        {
          label: "Events",
          icon: "pi pi-fw pi-book",
          routerLink: ["company/events"],
        },
        {
          label: "Privacy Settings",
          icon: "pi pi-fw pi-shield",
          routerLink: ["/privacy-settings"],
        },
      ];
    }
  }

  onKeydown(event: KeyboardEvent) {
    const nodeElement = <HTMLDivElement>event.target;
    if (event.code === "Enter" || event.code === "Space") {
      nodeElement.click();
      event.preventDefault();
    }
  }
}
