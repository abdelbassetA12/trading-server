import {
  FiHeart,
  FiStar,
} from "react-icons/fi";

export default function ProductCard({ product }) {
  const hasDiscount =
    product.pricing.discount?.enabled &&
    product.pricing.salePrice !== null &&
    product.pricing.salePrice < product.pricing.regularPrice;

  const currentPrice = hasDiscount
    ? product.pricing.salePrice
    : product.pricing.regularPrice;

  const isOutOfStock =
    product.inventory.status === "out_of_stock" ||
    product.inventory.quantity <= 0;

  const isLowStock =
    product.inventory.status === "low_stock" &&
    product.inventory.quantity > 0;

  const colors = product.variants?.colors || [];

  return (
    <>
    <article className="product-card">
      <div className="product-image-container">

        {/* Badge */}
        {product.badge?.enabled && (
          <span
            className={`product-badge ${
              product.badge.type === "sale"
                ? "sale"
                : ""
            }`}
          >
            {product.badge.text}
          </span>
        )}

        {/* Wishlist */}
        <button
          type="button"
          className="wishlist"
          aria-label={`إضافة ${product.name} إلى المفضلة`}
        >
          <FiHeart />
        </button>

        {/* Image */}
        <img
          src={product.thumbnail}
          alt={product.name}
        />

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="product-stock-overlay">
            نفد المخزون
          </div>
        )}
      </div>

      <div className="product-info">

        {/* Colors */}
        {colors.length > 0 && (
          <div className="product-colors">
            {colors.slice(0, 4).map((color) => (
              <span
                key={color.name}
                title={color.name}
                style={{
                  backgroundColor: color.value,
                }}
              />
            ))}
          </div>
        )}

        {/* Name */}
        <h3>{product.name}</h3>

        {/* Rating */}
        <div className="product-rating">
          <div className="stars">
            {Array.from({ length: 5 }).map(
              (_, index) => (
                <FiStar key={index} />
              )
            )}
          </div>

          <small>
            ({product.rating.count})
          </small>
        </div>

        {/* Price */}
        <div className="product-price">
          <strong>
            {currentPrice.toFixed(2)}{" "}
            {product.pricing.currency}
          </strong>

          {hasDiscount && (
            <del>
              {product.pricing.regularPrice.toFixed(2)}{" "}
              {product.pricing.currency}
            </del>
          )}
        </div>

        {/* Low stock */}
        {isLowStock && (
          <small className="product-low-stock">
            متبقي {product.inventory.quantity} فقط
          </small>
        )}
      </div>

    </article>
    <style>
      {`
      
/* =========================================================
   PRODUCT CARD
   Shared component
   ========================================================= */

.product-card {
  position: relative;

  min-width: 0;

  background: #fff;

  cursor: pointer;

  transition:
    transform 0.25s ease;
}

.product-card:hover {
  transform: translateY(-3px);
}


/* =========================================================
   PRODUCT IMAGE
   ========================================================= */

.product-image-container {
  position: relative;

  width: 100%;

  aspect-ratio: 1 / 1.12;

  overflow: hidden;

  background: #f5f5f5;
}

.product-image-container img {
  width: 100%;
  height: 100%;

  display: block;

  object-fit: cover;

  transition:
    transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.product-card:hover
.product-image-container img {
  transform: scale(1.045);
}


/* =========================================================
   BADGE
   ========================================================= */

.product-badge {
  position: absolute;

  top: 14px;
  right: 14px;

  z-index: 3;

  display: inline-flex;

  align-items: center;
  justify-content: center;

  min-height: 28px;

  padding: 5px 10px;

  background: #111;
  color: #fff;

  font-size: 11px;
  font-weight: 600;

  line-height: 1;

  border-radius: 2px;
}

.product-badge.sale {
  background: #b42318;
}


/* =========================================================
   WISHLIST
   ========================================================= */

.wishlist {
  position: absolute;

  top: 12px;
  left: 12px;

  z-index: 4;

  width: 38px;
  height: 38px;

  display: flex;

  align-items: center;
  justify-content: center;

  padding: 0;

  border: none;
  border-radius: 50%;

  background: rgba(255, 255, 255, 0.94);

  color: #222;

  cursor: pointer;

  box-shadow:
    0 2px 10px rgba(0, 0, 0, 0.06);

  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.wishlist svg {
  width: 18px;
  height: 18px;
}

.wishlist:hover {
  background: #111;

  color: #fff;

  transform: scale(1.05);
}


/* =========================================================
   STOCK OVERLAY
   ========================================================= */

.product-stock-overlay {
  position: absolute;

  inset: 0;

  z-index: 2;

  display: flex;

  align-items: center;
  justify-content: center;

  background: rgba(255, 255, 255, 0.58);

  color: #222;

  font-size: 14px;

  font-weight: 600;

  backdrop-filter: blur(1px);
}


/* =========================================================
   PRODUCT INFO
   ========================================================= */

.product-info {
  padding-top: 15px;
}


/* =========================================================
   COLORS
   ========================================================= */

.product-colors {
  display: flex;

  align-items: center;

  gap: 6px;

  min-height: 15px;

  margin-bottom: 9px;
}

.product-colors span {
  width: 12px;
  height: 12px;

  display: block;

  border-radius: 50%;

  border: 1px solid rgba(0, 0, 0, 0.12);

  box-sizing: border-box;
}


/* =========================================================
   PRODUCT NAME
   ========================================================= */

.product-info h3 {
  margin: 0;

  color: #171717;

  font-size: 15px;

  line-height: 1.7;

  font-weight: 600;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;
}


/* =========================================================
   RATING
   ========================================================= */

.product-rating {
  display: flex;

  align-items: center;

  gap: 7px;

  margin-top: 8px;
}

.stars {
  display: flex;

  align-items: center;

  gap: 2px;

  direction: ltr;
}

.stars svg {
  width: 13px;
  height: 13px;

  stroke: #222;

  fill: #222;
}

.product-rating small {
  color: #888;

  font-size: 11px;
}


/* =========================================================
   PRICE
   ========================================================= */

.product-price {
  display: flex;

  align-items: baseline;

  gap: 9px;

  margin-top: 10px;
}

.product-price strong {
  color: #111;

  font-size: 15px;

  font-weight: 700;
}

.product-price del {
  color: #999;

  font-size: 12px;

  font-weight: 400;
}


/* =========================================================
   LOW STOCK
   ========================================================= */

.product-low-stock {
  display: block;

  margin-top: 7px;

  color: #b42318;

  font-size: 11px;

  font-weight: 500;
}


/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width: 700px) {

  .product-image-container {
    aspect-ratio: 1 / 1.12;
  }

  .product-info {
    padding-top: 11px;
  }

  .product-info h3 {
    font-size: 13px;
  }

  .product-price strong {
    font-size: 13px;
  }

  .product-price del {
    font-size: 11px;
  }

  .wishlist {
    width: 34px;
    height: 34px;

    top: 9px;
    left: 9px;
  }

  .wishlist svg {
    width: 16px;
    height: 16px;
  }

  .product-badge {
    top: 10px;
    right: 10px;

    min-height: 25px;

    padding: 4px 8px;

    font-size: 10px;
  }
}


/* =========================================================
   SMALL MOBILE
   ========================================================= */

@media (max-width: 420px) {

  .product-rating {
    gap: 5px;
  }

  .stars {
    gap: 1px;
  }

  .stars svg {
    width: 11px;
    height: 11px;
  }

  .product-price {
    gap: 6px;
  }
}
 

      `}
    </style>
    </>
    
  );
}