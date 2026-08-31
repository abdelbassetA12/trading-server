import {
    FiArrowLeft
} from "react-icons/fi";

const categories = [

    {
        title: "حقائب الخصر",
        image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=500&q=80"
    },

    {
        title: "حقائب الظهر",
        image: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=500&q=80"
    },

    {
        title: "حقائب كروس",
        image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=500&q=80"
    },

    {
        title: "المحافظ",
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=500&q=80"
    },

    {
        title: "الإكسسوارات",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=80"
    },

    {
        title: "قبعات",
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=500&q=80"
    }

];

export default function CategoriesSection() {

    return (
        <section className="categories-section">

            <div className="categories-container">

                {categories.map((category, index) => (

                    <a
                        href="/products"
                        className="category-card"
                        key={index}
                    >

                        <div className="category-image">

                            <img
                                src={category.image}
                                alt={category.title}
                            />

                        </div>

                        <h3>
                            {category.title}
                        </h3>

                        <span>
                            تسوق الآن
                            <FiArrowLeft />
                        </span>

                    </a>

                ))}

            </div>
            <style>
                {`

                /* =========================================================
   CATEGORIES
   ========================================================= */

.categories-section {
    width: 100%;

    padding: 30px 0 22px;

    background: #fff;

    border-bottom: 1px solid #ebe7e1;

    font-family:
        "Cairo",
        "Tajawal",
        Arial,
        sans-serif;
}


.categories-container {
    width: min(
        calc(100% - 64px),
        1380px
    );

    margin: 0 auto;

    display: grid;

    grid-template-columns:
        repeat(6, minmax(0, 1fr));

    gap: 18px;
}


/* =========================================================
   CARD
   ========================================================= */

.category-card {
    min-width: 0;

    min-height: 158px;

    padding: 12px 10px 14px;

    border-radius: 10px;

    background: #f7f3ed;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: flex-end;

    overflow: hidden;

    color: #171717;

    text-decoration: none;

    transition:
        transform 0.25s ease,
        box-shadow 0.25s ease;
}


.category-card:hover {
    transform: translateY(-4px);

    box-shadow:
        0 12px 30px rgba(0, 0, 0, 0.07);
}


/* =========================================================
   IMAGE
   ========================================================= */

.category-image {
    width: 100%;

    height: 94px;

    display: flex;

    align-items: center;
    justify-content: center;
}


.category-image img {
    width: 100%;
    height: 100%;

    object-fit: contain;

    mix-blend-mode: multiply;
}


.category-card h3 {
    margin: 7px 0 2px;

    font-size: 12px;

    line-height: 1.5;

    font-weight: 800;
}


.category-card span {
    display: flex;

    align-items: center;

    gap: 5px;

    color: #333;

    font-size: 9px;
}


.category-card span svg {
    width: 11px;
    height: 11px;
}


/* =========================================================
   LAPTOP
   ========================================================= */

@media (max-width: 1200px) {

    .categories-container {
        width: calc(100% - 52px);

        gap: 13px;
    }
}


/* =========================================================
   TABLET
   ========================================================= */

@media (max-width: 900px) {

    .categories-container {
        width: calc(100% - 40px);

        grid-template-columns:
            repeat(3, minmax(0, 1fr));

        gap: 13px;
    }
}


/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width: 600px) {

    .categories-section {
        padding: 22px 0;
    }

    .categories-container {
        width: calc(100% - 30px);

        grid-template-columns:
            repeat(2, minmax(0, 1fr));

        gap: 10px;
    }

    .category-card {
        min-height: 140px;
    }

    .category-image {
        height: 82px;
    }
}
                `}
            </style>

        </section>
    );
}