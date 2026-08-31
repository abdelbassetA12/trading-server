import {
    FiInstagram,
    FiFacebook,
    FiMapPin,
    FiPhone,
    FiMail
} from "react-icons/fi";

export default function Footer() {

    return (
        <footer className="footer">

            <div className="footer-container">


                {/* Brand */}

                <div className="footer-brand">

                    <div className="footer-logo">

                        <span>
                            M
                        </span>

                        <strong>
                            AMAROC
                        </strong>

                    </div>

                    <p>
                        أسلوبك في كل تفاصيلك.
                    </p>

                    <p>
                        جودة، ثقة، تميز.
                    </p>

                </div>


                {/* Contact */}

                <div className="footer-column">

                    <h3>
                        تواصل معنا
                    </h3>

                    <div>
                        <FiPhone />
                        <span>+212 600 000 000</span>
                    </div>

                    <div>
                        <FiMail />
                        <span>info@amaroc.com</span>
                    </div>

                    <div>
                        <FiMapPin />
                        <span>الدار البيضاء، المغرب</span>
                    </div>

                </div>


                {/* Links */}

                <div className="footer-column">

                    <h3>
                        روابط سريعة
                    </h3>

                    <a href="/about">
                        من نحن
                    </a>

                    <a href="/shipping">
                        سياسة الشحن
                    </a>

                    <a href="/returns">
                        سياسة الإرجاع
                    </a>

                    <a href="/privacy">
                        سياسة الخصوصية
                    </a>

                </div>


                {/* App */}

                <div className="footer-column app-column">

                    <h3>
                        حمل التطبيق
                    </h3>

                    <p>
                        تسوق بسهولة من تطبيقنا
                    </p>

                    <div className="app-buttons">

                        <div>
                            Google Play
                        </div>

                        <div>
                            App Store
                        </div>

                    </div>

                </div>


            </div>


            <div className="footer-bottom">

                <span>
                    © 2026 AMAROC. جميع الحقوق محفوظة.
                </span>

                <div className="social-icons">

                    <FiInstagram />
                    <FiFacebook />

                </div>

            </div>
            <style>
                {`
                /* =========================================================
   FOOTER
   ========================================================= */

.footer {
    width: 100%;

    padding-top: 35px;

    background: #f8f5f0;

    font-family:
        "Cairo",
        "Tajawal",
        Arial,
        sans-serif;
}


.footer-container {
    width: min(
        calc(100% - 64px),
        1380px
    );

    margin: 0 auto;

    padding-bottom: 30px;

    display: grid;

    grid-template-columns:
        1.2fr
        1fr
        1fr
        1fr;

    gap: 55px;
}


/* =========================================================
   BRAND
   ========================================================= */

.footer-brand {
    text-align: right;
}


.footer-logo {
    display: flex;

    align-items: center;

    gap: 8px;

    direction: ltr;
}


.footer-logo span {
    font-size: 35px;

    line-height: 1;

    font-weight: 900;

    transform: skew(-12deg);
}


.footer-logo strong {
    font-size: 21px;

    font-weight: 800;
}


.footer-brand p {
    margin: 5px 0;

    color: #777;

    font-size: 9px;

    line-height: 1.7;
}


/* =========================================================
   COLUMNS
   ========================================================= */

.footer-column {
    display: flex;

    flex-direction: column;

    align-items: flex-start;

    gap: 8px;
}


.footer-column h3 {
    margin: 0 0 4px;

    font-size: 12px;

    font-weight: 900;
}


.footer-column a,
.footer-column > div {
    display: flex;

    align-items: center;

    gap: 7px;

    color: #666;

    text-decoration: none;

    font-size: 9px;

    line-height: 1.7;

    transition: color 0.2s ease;
}


.footer-column a:hover {
    color: #111;
}


.footer-column svg {
    width: 13px;
    height: 13px;
}


/* =========================================================
   APP
   ========================================================= */

.footer-column p {
    margin: 0;

    color: #777;

    font-size: 9px;
}


.app-buttons {
    display: flex !important;

    flex-direction: row !important;

    gap: 7px;

    margin-top: 3px;
}


.app-buttons div {
    padding: 7px 10px;

    border-radius: 5px;

    background: #111;

    color: #fff !important;

    font-size: 8px !important;
}


/* =========================================================
   BOTTOM
   ========================================================= */

.footer-bottom {
    width: min(
        calc(100% - 64px),
        1380px
    );

    margin: 0 auto;

    min-height: 52px;

    border-top: 1px solid #e3ded5;

    display: flex;

    align-items: center;

    justify-content: space-between;

    color: #888;

    font-size: 8px;
}


.social-icons {
    display: flex;

    align-items: center;

    gap: 12px;
}


.social-icons svg {
    width: 15px;
    height: 15px;
}


/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width: 1200px) {

    .footer-container,
    .footer-bottom {
        width: calc(100% - 52px);
    }

    .footer-container {
        gap: 35px;
    }
}


@media (max-width: 900px) {

    .footer-container,
    .footer-bottom {
        width: calc(100% - 40px);
    }

    .footer-container {
        grid-template-columns:
            repeat(2, minmax(0, 1fr));

        gap: 35px;
    }
}


@media (max-width: 600px) {

    .footer {
        padding-top: 28px;
    }

    .footer-container,
    .footer-bottom {
        width: calc(100% - 30px);
    }

    .footer-container {
        grid-template-columns:
            repeat(2, minmax(0, 1fr));

        gap: 28px 20px;
    }

    .footer-logo span {
        font-size: 28px;
    }

    .footer-logo strong {
        font-size: 17px;
    }

    .footer-bottom {
        min-height: 50px;

        font-size: 7px;
    }
}


@media (max-width: 390px) {

    .footer-container,
    .footer-bottom {
        width: calc(100% - 24px);
    }

    .footer-container {
        gap: 25px 12px;
    }
}
                `}
            </style>

        </footer>
    );
}