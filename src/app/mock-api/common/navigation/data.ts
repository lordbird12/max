/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';
import { AuthService } from 'app/core/auth/auth.service';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        title: 'ผู้ดูแลระบบ',
        subtitle: 'เมนูหลักการใช้งานสำหรับผู้ดูแลระบบ',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                title: 'ภาพแบนเนอร์',
                type: 'basic',
                icon: 'heroicons_outline:fast-forward',
                link: '/banner/list',
            },
            {
                title: 'เกี่ยวกับ',
                type: 'basic',
                icon: 'heroicons_outline:emoji-happy',
                link: '/about/list',
            },
            {
                title: 'ช่องทางติดต่อ',
                type: 'basic',
                icon: 'heroicons_outline:exclamation-circle',
                link: '/contact/list',
            },
            {
                title: 'ข่าวสารและกิจกรรม',
                type: 'basic',
                icon: 'heroicons_outline:bell',
                link: '/announcement/list',
            },
            {
                title: 'วีดีโอแนะนำและสถิติ',
                type: 'basic',
                icon: 'heroicons_outline:video-camera',
                link: '/video/list',
            }
        ],
    },

    {
        title: 'จัดการแกลลอรี่',
        subtitle: 'เมนูหลักการใช้งานสำหรับแกลลอรี่',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                title: 'หมวดหมู่แกลลอรี่',
                type: 'basic',
                link: '/gallery-category/list',
                icon: 'heroicons_outline:video-camera',
            },
            {
                title: 'แกลลอรี่',
                type: 'basic',
                link: '/gallery/list',
                icon: 'heroicons_outline:video-camera',
            },
        ],
    },


    {
        title: 'จัดการสินค้า',
        subtitle: 'เมนูหลักการใช้งานสำหรับสินค้า',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                title: 'ประเภทสินค้า',
                type: 'basic',
                link: '/product-category/list',
                icon: 'heroicons_outline:cube',
            },
            {
                title: 'สินค้า',
                type: 'basic',
                link: '/products/list',
                icon: 'heroicons_outline:cube',
            },
            {
                title: 'โมเดล',
                type: 'basic',
                link: '/model-category/list',
                icon: 'heroicons_outline:book-open',
            },
        ],
    },

    {
        title: 'จัดการสมาชิก',
        subtitle: 'เมนูหลักการใช้งานสำหรับสมาชิก',
        type: 'group',
        icon: 'heroicons_outline:users',
        children: [
            {
                title: 'สมาชิก',
                type: 'basic',
                link: '/members/list',
                icon: 'heroicons_outline:users',
            },
            {
                title: 'คำสั่งซื้อ',
                type: 'basic',
                link: '/orders/list',
                icon: 'heroicons_outline:book-open',
            },
            {
                title: 'รายงาน',
                type: 'basic',
                link: '/report/list',
                icon: 'heroicons_outline:chart-pie',
            },
        ],
    },
    {
        title: 'จัดการส่วนตัว',
        subtitle: 'เมนูหลักการใช้งานสำหรับจัดการส่วนตัว',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                title: 'โปรไฟล์สมาขิก',
                type: 'basic',
                link: '/profile',
                icon: 'heroicons_outline:pencil-alt',
            },
            {
                title: 'ออกจากระบบ',
                type: 'basic',
                icon: 'heroicons_solid:logout',
                link: '/sign-out',
            },
        ],
    },
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        title: 'Dashboards',
        tooltip: 'Dashboards',
        type: 'aside',
        icon: 'heroicons_outline:home',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'apps',
        title: 'Apps',
        tooltip: 'Apps',
        type: 'aside',
        icon: 'heroicons_outline:qrcode',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'pages',
        title: 'Pages',
        tooltip: 'Pages',
        type: 'aside',
        icon: 'heroicons_outline:document-duplicate',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'user-interface',
        title: 'UI',
        tooltip: 'UI',
        type: 'aside',
        icon: 'heroicons_outline:collection',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'navigation-features',
        title: 'Navigation',
        tooltip: 'Navigation',
        type: 'aside',
        icon: 'heroicons_outline:menu',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboards',
        title: 'DASHBOARDS',
        type: 'group',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'apps',
        title: 'APPS',
        type: 'group',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'others',
        title: 'OTHERS',
        type: 'group',
    },
    {
        id: 'pages',
        title: 'Pages',
        type: 'aside',
        icon: 'heroicons_outline:document-duplicate',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'user-interface',
        title: 'User Interface',
        type: 'aside',
        icon: 'heroicons_outline:collection',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'navigation-features',
        title: 'Navigation Features',
        type: 'aside',
        icon: 'heroicons_outline:menu',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboards',
        title: 'Dashboards',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'apps',
        title: 'Apps',
        type: 'group',
        icon: 'heroicons_outline:qrcode',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'pages',
        title: 'Pages',
        type: 'group',
        icon: 'heroicons_outline:document-duplicate',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'user-interface',
        title: 'UI',
        type: 'group',
        icon: 'heroicons_outline:collection',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'navigation-features',
        title: 'Misc',
        type: 'group',
        icon: 'heroicons_outline:menu',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
];
