import React from "react";

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = "w-6 h-6" }) => {
  const n = (name || "").toLowerCase();

  // 1. Momos / Dumplings / Dimsum
  if (n.includes("momo") || n.includes("dimsum") || n.includes("dumpling")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Momo/Dumpling contour with top pleat */}
        <path d="M12 4c-.8 0-1.5.7-1.5 1.5 0 .5.3 1 .8 1.3C7.5 7.5 4 10.5 4 14.5c0 4.2 3.8 6.5 8 6.5s8-2.3 8-6.5c0-4-3.5-7-7.3-7.7.5-.3.8-.8.8-1.3C13.5 4.7 12.8 4 12 4z" />
        <path d="M12 7v5" />
        <path d="M9.5 8.5C9 10 8.5 12 8.5 14" />
        <path d="M14.5 8.5c.5 1.5 1 3.5 1 5.5" />
      </svg>
    );
  }

  // 2. Rolls / Wraps / Shawarma
  if (n.includes("roll") || n.includes("wrap") || n.includes("burrito") || n.includes("shawarma")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 17l10-10 6 6-10 10c-1.5 1.5-3.5 1.5-5 0l-1-1c-1.5-1.5-1.5-3.5 0-5z" />
        <path d="M14 7l3 3" />
        <path d="M11 10l3 3" />
        <path d="M8 13l3 3" />
        <ellipse cx="6" cy="18" rx="2.5" ry="1.5" transform="rotate(-45 6 18)" />
      </svg>
    );
  }

  // 3. Noodles / Rice / Chinese / Manchurian / Chowmein
  if (n.includes("noodle") || n.includes("rice") || n.includes("chinese") || n.includes("manchurian") || n.includes("chowmein") || n.includes("pasta") || n.includes("maggi")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11c0 5 4 9 9 9s9-4 9-9H3z" />
        <path d="M6 11c0-2 1.5-3.5 3-4s3-1 3-3" />
        <path d="M10 11c0-1.5 1-2.5 2-3s2-1 2-2.5" />
        <path d="M14 11c0-2 1.5-3 2.5-4s1.5-1.5 1.5-3" />
        <line x1="17" y1="2" x2="22" y2="7" />
        <line x1="18.5" y1="2.5" x2="23" y2="7" />
        <path d="M8 20h8" />
      </svg>
    );
  }

  // 4. Beverages / Coffee / Tea / Drinks / Chai / Shakes / Mocktails / Cold Drink
  if (n.includes("beverage") || n.includes("drink") || n.includes("coffee") || n.includes("tea") || n.includes("chai") || n.includes("shake") || n.includes("juice") || n.includes("mocktail") || n.includes("cooler")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8h12l-1.5 12a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2L6 8z" />
        <line x1="4" y1="8" x2="20" y2="8" />
        <line x1="13" y1="2" x2="15" y2="8" />
        <path d="M10 13a2.5 2.5 0 0 0 4 0" />
      </svg>
    );
  }

  // 5. Burgers
  if (n.includes("burger")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11c0-3.9 3.6-7 8-7s8 3.1 8 7H4z" />
        <rect x="3" y="14" width="18" height="3" rx="1.5" />
        <path d="M4 17h16c0 2.2-2.7 4-8 4s-8-1.8-8-4z" />
        <path d="M5 11c1 1 2 0 3 1s2 0 3 1 2 0 3 1 2 0 3 1" />
      </svg>
    );
  }

  // 6. Sandwiches
  if (n.includes("sandwich") || n.includes("toast") || n.includes("garlic bread")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 19 21 19 21 6 3 19" />
        <line x1="3" y1="19" x2="21" y2="6" />
        <path d="M7 17l8-5" />
        <path d="M10 18l7-4" />
      </svg>
    );
  }

  // 7. Pizza
  if (n.includes("pizza")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L3 19a16 16 0 0 0 18 0L12 2z" />
        <path d="M3 19a16 16 0 0 0 18 0" />
        <circle cx="12" cy="11" r="1.5" />
        <circle cx="9" cy="15" r="1" />
        <circle cx="15" cy="15" r="1" />
      </svg>
    );
  }

  // 8. Tandoor / Starters / Snacks / Crispy / Fries
  if (n.includes("snack") || n.includes("starter") || n.includes("fry") || n.includes("fries") || n.includes("chaat") || n.includes("tandoor") || n.includes("tikka") || n.includes("kebab")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a9 9 0 0 0-9 9c0 4.5 3.5 8.2 8 8.8V21h2v-.2c4.5-.6 8-4.3 8-8.8a9 9 0 0 0-9-9z" />
        <path d="M8 12c1.5 2 3.5 2 5 0" />
        <circle cx="9" cy="9" r="1" />
        <circle cx="15" cy="9" r="1" />
      </svg>
    );
  }

  // 9. Desserts / Sweet / Bakery / Cake / Ice Cream
  if (n.includes("dessert") || n.includes("cake") || n.includes("pastry") || n.includes("sweet") || n.includes("bakery") || n.includes("ice cream") || n.includes("waffle")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 10h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10z" />
        <path d="M6 10c0-2 2-3 3-3s2 1 3 1 2-1 3-1 3 1 3 3" />
        <circle cx="12" cy="4" r="2" />
        <line x1="12" y1="6" x2="12" y2="7" />
      </svg>
    );
  }

  // 10. Combos / Thali / Meals
  if (n.includes("combo") || n.includes("thali") || n.includes("meal") || n.includes("platter")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="8.5" cy="9.5" r="2.5" />
        <circle cx="15.5" cy="9.5" r="2.5" />
        <circle cx="12" cy="16" r="2.5" />
      </svg>
    );
  }

  // Default / Others / Rice Bowl
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11c0 5 3.5 8 8 8s8-3 8-8H4z" />
      <path d="M12 4v4" />
      <path d="M8 5v3" />
      <path d="M16 5v3" />
      <path d="M7 19h10" />
    </svg>
  );
};

export default CategoryIcon;
