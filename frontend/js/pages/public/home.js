// js/pages/public/home.js
import { renderPublicLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';

export async function homePage() {
  renderPublicLayout((content) => {
    
    // Inject styles (Only if they don't exist yet)
    if (!document.getElementById('home-styles')) {
      const style = document.createElement('style');
      style.id = 'home-styles';
      style.textContent = `
        /* Background 3D Animation */
        .bg-3d-anim {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          z-index: -1;
          background: #090d14;
          overflow: hidden;
          perspective: 1000px;
        }
        .bg-3d-anim::before {
          content: '';
          position: absolute;
          width: 200%; height: 200%;
          top: -50%; left: -50%;
          background: radial-gradient(circle at center, rgba(56,189,248,0.05) 0%, transparent 60%);
          animation: rotateBg 30s linear infinite;
        }
        .grid-plane {
          position: absolute;
          width: 200%; height: 200%;
          top: 0; left: -50%;
          background-image: 
            linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          transform: rotateX(60deg) translateY(-100px) translateZ(-200px);
          animation: moveGrid 15s linear infinite;
        }
        @keyframes rotateBg {
          100% { transform: rotate(360deg); }
        }
        @keyframes moveGrid {
          0% { transform: rotateX(60deg) translateY(0) translateZ(-200px); }
          100% { transform: rotateX(60deg) translateY(50px) translateZ(-200px); }
        }

        /* Typing & Text */
        .typing-cursor::after { content: '|'; animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
        .gradient-text { background: linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        /* Reveal Scroll Animation */
        .reveal-up {
          opacity: 0;
          transform: translateY(60px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-up.in-view {
          opacity: 1;
          transform: translateY(0);
        }

        /* Mirror Shine Effect on Cards */
        .shine-card {
          position: relative;
          background: #131b2a;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 2rem;
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .shine-card::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%);
          transform: skewX(-25deg);
          transition: left 0.7s ease;
        }
        .shine-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.4);
          border-color: rgba(56,189,248,0.3);
        }
        .shine-card:hover::after {
          left: 200%;
        }

        /* Continuous Sliding Marquee */
        .marquee-container {
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          padding: 2rem 0;
        }
        .marquee-container::before, .marquee-container::after {
          content: '';
          position: absolute;
          top: 0; width: 150px; height: 100%;
          z-index: 2;
        }
        .marquee-container::before {
          left: 0;
          background: linear-gradient(to right, #090d14 0%, transparent 100%);
        }
        .marquee-container::after {
          right: 0;
          background: linear-gradient(to left, #090d14 0%, transparent 100%);
        }
        .marquee-content {
          display: inline-block;
          animation: marqueeScroll 20s linear infinite;
        }
        .marquee-content:hover {
          animation-play-state: paused;
        }
        .marquee-item {
          display: inline-block;
          width: 300px;
          height: 200px;
          margin: 0 15px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 20px rgba(0,0,0,0.5);
          position: relative;
        }
        .marquee-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }
        .marquee-item:hover img {
          transform: scale(1.1);
        }
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Categories Grid fixed */
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          width: 100%;
        }
      `;
      document.head.appendChild(style);
    }

    content.innerHTML = `
      <!-- Background 3D Layer -->
      <div class="bg-3d-anim"><div class="grid-plane"></div></div>

      <!-- Hero Section -->
      <section id="hero-section" style="min-height:90vh; display:flex; align-items:center; padding:4rem 2rem; position:relative;">
        <div style="max-width:1200px; margin:0 auto; display:grid; grid-template-columns: 1.2fr 0.8fr; gap:4rem; align-items:center; width:100%;">
          
          <div class="reveal-up" style="z-index:2;">
            <div style="display:inline-flex; align-items:center; gap:8px; padding:6px 16px; background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.2); border-radius:99px; margin-bottom:1.5rem;">
              <span style="font-size:0.8rem; color:#38bdf8; font-weight:600; letter-spacing:1px;">THE INDUSTRIAL STANDARD</span>
            </div>
            <h1 style="font-size:clamp(2.5rem, 4vw, 4rem); font-weight:900; color:#f8fafc; line-height:1.1; margin-bottom:1.5rem;">
              Elevating your <br/>
              <span class="gradient-text typing-cursor" id="typing-text">Industry</span><br/>
              with expert care.
            </h1>
            <p style="font-size:1.1rem; color:#94a3b8; margin-bottom:2.5rem; line-height:1.7; max-width:480px;">
              OneKeep is the definitive platform connecting top-tier industrial facilities with verified, highly-skilled professionals for all maintenance, repair, and operational needs.
            </p>
            <div style="display:flex; gap:16px;">
              <a href="#/categories" style="padding:16px 36px; background:linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%); color:#090d14; border-radius:10px; font-weight:800; text-decoration:none; font-size:1rem; box-shadow: 0 8px 20px rgba(56,189,248,0.2);">Explore Services</a>
              <a href="#about-us" style="padding:16px 36px; background:rgba(255,255,255,0.05); color:#f8fafc; border:1px solid rgba(255,255,255,0.1); border-radius:10px; font-weight:600; text-decoration:none; font-size:1rem;">Learn More</a>
            </div>
          </div>

          <!-- Decorative Graphic -->
          <div class="reveal-up" style="position:relative; height:500px; display:flex; justify-content:center; align-items:center;">
             <div style="position:absolute; width:400px; height:400px; background:radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%); border-radius:50%; filter:blur(40px);"></div>
             <img src="./assets/oneKeep Logo.png" style="width:250px; z-index:2; animation: bounce 4s infinite ease-in-out;" alt="OneKeep Logo"/>
          </div>
        </div>
      </section>

      <!-- Excellence Section -->
      <section style="padding:5rem 2rem; position:relative; z-index:1;">
        <div style="max-width:1100px; margin:0 auto; text-align:center;">
          <h2 class="reveal-up" style="font-size:2.5rem; font-weight:800; color:#f8fafc; margin-bottom:1rem;">Excellence in Every Detail</h2>
          <p class="reveal-up" style="color:#94a3b8; max-width:600px; margin:0 auto 4rem; font-size:1.1rem;">We don't just fix problems; we optimize your entire infrastructure. Experience the OneKeep advantage.</p>
          
          <div class="grid-3" style="gap:2rem;">
            ${[['⚡', 'Lightning Fast SLA', 'Guaranteed response times within 24-48 hours across all major industrial categories.'],
               ['🛡️', 'Verified Experts', 'Every technician is rigorously vetted, certified, and trained for enterprise-grade environments.'],
               ['⚙️', 'Comprehensive AMC', 'From HVAC to Server Racks, our holistic Annual Maintenance Contracts cover it all.']].map(([i,t,d]) => `
              <div class="shine-card reveal-up" style="text-align:left;">
                <div style="width:60px; height:60px; background:rgba(56,189,248,0.1); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:2rem; margin-bottom:1.5rem; color:#38bdf8;">${i}</div>
                <h3 style="font-size:1.3rem; font-weight:700; color:#f8fafc; margin-bottom:1rem;">${t}</h3>
                <p style="color:#64748b; font-size:0.95rem; line-height:1.6;">${d}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Sliding Pics Section -->
      <section style="padding:2rem 0 5rem 0; position:relative; z-index:1;">
        <div class="marquee-container reveal-up">
          <div class="marquee-content">
            <!-- Doubled for seamless scrolling -->
            <div class="marquee-item"><img src="./assets/worker 1.jpg" alt="Worker 1"/></div>
            <div class="marquee-item"><img src="./assets/worker 2.webp" alt="Worker 2"/></div>
            <div class="marquee-item"><img src="./assets/worker 3.avif" alt="Worker 3"/></div>
            <div class="marquee-item"><img src="./assets/worker 4.jpg" alt="Worker 4"/></div>
            <div class="marquee-item"><img src="./assets/worker 5.jpg" alt="Worker 5"/></div>
            
            <div class="marquee-item"><img src="./assets/worker 1.jpg" alt="Worker 1"/></div>
            <div class="marquee-item"><img src="./assets/worker 2.webp" alt="Worker 2"/></div>
            <div class="marquee-item"><img src="./assets/worker 3.avif" alt="Worker 3"/></div>
            <div class="marquee-item"><img src="./assets/worker 4.jpg" alt="Worker 4"/></div>
            <div class="marquee-item"><img src="./assets/worker 5.jpg" alt="Worker 5"/></div>
          </div>
        </div>
      </section>

      <!-- About Us Section -->
      <section id="about-us" style="padding:6rem 2rem; position:relative; z-index:1; background:rgba(19, 27, 42, 0.4); border-top:1px solid rgba(255,255,255,0.05); border-bottom:1px solid rgba(255,255,255,0.05);">
        <div style="max-width:1100px; margin:0 auto; display:grid; grid-template-columns: 1fr 1fr; gap:4rem; align-items:center;">
          <div class="reveal-up">
            <h2 style="font-size:2.5rem; font-weight:800; color:#f8fafc; margin-bottom:1.5rem;">About <span style="color:#38bdf8;">OneKeep</span></h2>
            <p style="color:#94a3b8; font-size:1.1rem; line-height:1.8; margin-bottom:1.5rem;">
              OneKeep was founded with a singular vision: to revolutionize industrial maintenance by bringing transparency, speed, and uncompromising quality to the marketplace. 
              We understand that downtime in an industrial setting costs more than just money—it halts progress.
            </p>
            <p style="color:#94a3b8; font-size:1.1rem; line-height:1.8; margin-bottom:2rem;">
              By leveraging a strict vetting process, real-time tracking, and a network of highly specialized professionals, we've created an ecosystem where facility managers can request complex services—from HV/LV electrical panels to advanced automation systems—with absolute confidence.
            </p>
            <ul style="list-style:none; display:grid; gap:15px; color:#f8fafc; font-weight:500;">
              <li style="display:flex; align-items:center; gap:10px;"><span style="color:#2dd4bf; font-size:1.2rem;">✓</span> Industry-Certified Technicians</li>
              <li style="display:flex; align-items:center; gap:10px;"><span style="color:#2dd4bf; font-size:1.2rem;">✓</span> Transparent Digital Quotes</li>
              <li style="display:flex; align-items:center; gap:10px;"><span style="color:#2dd4bf; font-size:1.2rem;">✓</span> 24/7 Priority Support</li>
            </ul>
          </div>
          <div class="reveal-up" style="position:relative;">
             <div class="shine-card" style="padding:1rem;">
               <img src="./assets/worker 4.jpg" style="width:100%; border-radius:12px; object-fit:cover; height:400px;" alt="About Us"/>
             </div>
          </div>
        </div>
      </section>

      <!-- Services Section -->
      <section id="services" style="padding:6rem 2rem; position:relative; z-index:1;">
        <div style="max-width:1200px; margin:0 auto;">
          <h2 class="reveal-up" style="font-size:2.5rem; font-weight:800; color:#f8fafc; text-align:center; margin-bottom:0.5rem;">Our Services</h2>
          <p class="reveal-up" style="text-align:center; color:#94a3b8; margin-bottom:3rem; font-size:1.1rem;">A complete suite of industrial maintenance and repair solutions.</p>
          
          <div id="home-cats-grid" class="cat-grid">
            <!-- Populated via JS -->
          </div>
          
          <div class="reveal-up" style="text-align:center; margin-top:4rem;">
            <a href="#/categories" style="padding:14px 36px; background:rgba(56,189,248,0.1); border:1px solid #38bdf8; color:#38bdf8; border-radius:8px; text-decoration:none; font-weight:700; font-size:1rem; transition:all 0.3s;" onmouseenter="this.style.background='rgba(56,189,248,0.2)'; this.style.boxShadow='0 0 15px rgba(56,189,248,0.3)';" onmouseleave="this.style.background='rgba(56,189,248,0.1)'; this.style.boxShadow='none';">View Full Catalog →</a>
          </div>
        </div>
      </section>

      <!-- Reviews Section -->
      <section id="reviews" style="padding:6rem 2rem; position:relative; z-index:1; background:rgba(19, 27, 42, 0.4); border-top:1px solid rgba(255,255,255,0.05);">
        <div style="max-width:1100px; margin:0 auto;">
          <div class="reveal-up" style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:3rem; flex-wrap:wrap; gap:1rem;">
            <div>
              <h2 style="font-size:2.5rem; font-weight:800; color:#f8fafc; margin-bottom:0.5rem;">Trusted by Leaders</h2>
              <p style="color:#94a3b8; font-size:1.1rem;">See what facility managers and engineers are saying.</p>
            </div>
            <div style="color:#f59e0b; font-size:1.5rem; letter-spacing:2px;">★★★★★</div>
          </div>
          
          <div class="grid-3" style="gap:2rem;">
            <div class="shine-card reveal-up">
              <div style="color:#38bdf8; font-size:2.5rem; margin-bottom:1rem; opacity:0.5; line-height:1;">"</div>
              <p style="color:#e2e8f0; font-size:1rem; line-height:1.7; margin-bottom:1.5rem; font-style:italic;">"OneKeep entirely transformed how we handle our factory's HVAC maintenance. Their experts arrived within 12 hours and resolved an issue that had plagued us for weeks."</p>
              <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:45px; height:45px; border-radius:50%; background:#090d14; border:1px solid #38bdf8; display:flex; align-items:center; justify-content:center; font-weight:700; color:#38bdf8;">RK</div>
                <div>
                  <div style="font-weight:700; color:#f8fafc; font-size:0.95rem;">Rajesh Kumar</div>
                  <div style="color:#64748b; font-size:0.8rem;">Plant Head, Tata Steel</div>
                </div>
              </div>
            </div>
            
            <div class="shine-card reveal-up">
              <div style="color:#38bdf8; font-size:2.5rem; margin-bottom:1rem; opacity:0.5; line-height:1;">"</div>
              <p style="color:#e2e8f0; font-size:1rem; line-height:1.7; margin-bottom:1.5rem; font-style:italic;">"The best AMC service platform for our electrical panels. The transparency in pricing and automated scheduling means I never worry about our HT panels going unserviced."</p>
              <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:45px; height:45px; border-radius:50%; background:#090d14; border:1px solid #38bdf8; display:flex; align-items:center; justify-content:center; font-weight:700; color:#38bdf8;">AS</div>
                <div>
                  <div style="font-weight:700; color:#f8fafc; font-size:0.95rem;">Aditi Sharma</div>
                  <div style="color:#64748b; font-size:0.8rem;">Facility Manager, RIL</div>
                </div>
              </div>
            </div>

            <div class="shine-card reveal-up">
              <div style="color:#38bdf8; font-size:2.5rem; margin-bottom:1rem; opacity:0.5; line-height:1;">"</div>
              <p style="color:#e2e8f0; font-size:1rem; line-height:1.7; margin-bottom:1.5rem; font-style:italic;">"We rely on OneKeep for our SCADA and automation support. Their technicians are essentially specialized engineers. The response time and knowledge base are unmatched."</p>
              <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:45px; height:45px; border-radius:50%; background:#090d14; border:1px solid #38bdf8; display:flex; align-items:center; justify-content:center; font-weight:700; color:#38bdf8;">MN</div>
                <div>
                  <div style="font-weight:700; color:#f8fafc; font-size:0.95rem;">Manoj Nair</div>
                  <div style="color:#64748b; font-size:0.8rem;">Operations Director, L&T</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer style="padding:4rem 2rem 2rem; position:relative; z-index:1;">
        <div style="max-width:1100px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:4rem; margin-bottom:3rem;">
          <div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:1rem;">
              <img src="./assets/oneKeep Logo.png" style="width:40px; height:40px; border-radius:8px;" alt="OneKeep"/>
              <span style="font-family:'Space Grotesk',sans-serif; font-weight:800; font-size:1.5rem; color:#f8fafc; letter-spacing:0px;">OneKeep</span>
            </div>
            <p style="color:#64748b; font-size:0.95rem; line-height:1.6; max-width:300px;">
              The ultimate industrial service marketplace. Elevating operational efficiency through verified expertise.
            </p>
          </div>
          <div>
            <h4 style="color:#f8fafc; font-weight:700; margin-bottom:1.2rem; font-size:1.1rem;">Quick Links</h4>
            <div style="display:flex; flex-direction:column; gap:12px;">
              <a href="#about-us" style="color:#94a3b8; text-decoration:none; font-size:0.95rem; transition:color 0.2s;" onmouseenter="this.style.color='#38bdf8'" onmouseleave="this.style.color='#94a3b8'">About Us</a>
              <a href="#/categories" style="color:#94a3b8; text-decoration:none; font-size:0.95rem; transition:color 0.2s;" onmouseenter="this.style.color='#38bdf8'" onmouseleave="this.style.color='#94a3b8'">Services</a>
              <a href="#reviews" style="color:#94a3b8; text-decoration:none; font-size:0.95rem; transition:color 0.2s;" onmouseenter="this.style.color='#38bdf8'" onmouseleave="this.style.color='#94a3b8'">Reviews</a>
            </div>
          </div>
          <div>
            <h4 style="color:#f8fafc; font-weight:700; margin-bottom:1.2rem; font-size:1.1rem;">Contact</h4>
            <div style="display:flex; flex-direction:column; gap:12px; color:#94a3b8; font-size:0.95rem;">
              <div style="display:flex; gap:10px;"><span style="color:#38bdf8;">📧</span> support@onekeep.in</div>
              <div style="display:flex; gap:10px;"><span style="color:#38bdf8;">📍</span> Mumbai, Maharashtra, India</div>
              <div style="display:flex; gap:10px;"><span style="color:#38bdf8;">📞</span> +91 98765 43210</div>
            </div>
          </div>
        </div>
        <div style="text-align:center; padding-top:2rem; border-top:1px solid rgba(255,255,255,0.05); color:#475569; font-size:0.85rem;">
          © 2024 OneKeep Technologies. All rights reserved.
        </div>
      </footer>
    `;

    // Initialize Scroll Reveal Observer
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          // Optional: stop observing once revealed
          // observer.unobserve(entry.target); 
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));


    // Typing Effect Logic
    const words = ["Industry", "Factory", "Facility", "Plant", "Operations"];
    let wordIdx = 0;
    let charIdx = words[0].length;
    let isDeleting = true;
    
    function typeEffect() {
      const typingEl = document.getElementById('typing-text');
      if (!typingEl) return;
      
      const currentWord = words[wordIdx];
      
      if (isDeleting) charIdx--;
      else charIdx++;
      
      typingEl.textContent = currentWord.substring(0, charIdx);

      let typeSpeed = isDeleting ? 50 : 100;

      if (!isDeleting && charIdx === currentWord.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        wordIdx = (wordIdx + 1) % words.length;
        typeSpeed = 400;
      }
      
      setTimeout(typeEffect, typeSpeed);
    }
    setTimeout(typeEffect, 2000);


    // Fetch and Render Categories (Services)
    const fallbackCats = [
      { _id: 'hvac', name: 'HVAC & Climate', icon: '❄️', desc: 'Cooling, ventilation, and climate systems.' },
      { _id: 'elec', name: 'Electrical Panel', icon: '⚡', desc: 'Panels, switchgear, and protection systems.' },
      { _id: 'auto', name: 'Automation', icon: '🤖', desc: 'PLCs, SCADA, HMIs, and machine vision.' },
      { _id: 'mtr', name: 'Motors & Drives', icon: '⚙️', desc: 'Industrial motors, starters, and drives.' },
      { _id: 'pwr', name: 'Backup Power', icon: '🔋', desc: 'UPS, inverters, batteries, and DG sets.' },
      { _id: 'fire', name: 'Fire Safety', icon: '🧯', desc: 'Fire alarms, hydrants, and suppression.' }
    ];

    function renderCatsGrid(catsData) {
      const grid = document.getElementById('home-cats-grid');
      if (!grid) return;
      
      grid.innerHTML = catsData.map((c, i) => `
        <a href="#/categories/${c._id}" class="shine-card reveal-up" style="
          display:flex; flex-direction:column; text-align:left; text-decoration:none;
        ">
          <div style="font-size:2.5rem; margin-bottom:15px; color:#38bdf8;">${c.icon||'⚙️'}</div>
          <div style="font-weight:700; color:#f8fafc; margin-bottom:8px; font-size:1.2rem;">${c.name}</div>
          <div style="font-size:0.9rem; color:#94a3b8; line-height:1.5;">${(c.description||c.desc||'').slice(0,90)}</div>
        </a>
      `).join('');

      // Add new elements to observer
      grid.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
    }

    API.get('/categories', { silent:true })
      .then(res => {
        let cats = res?.categories || res?.data || [];
        if (!cats || cats.length === 0) cats = fallbackCats;
        renderCatsGrid(cats.slice(0, 8)); // Ensure symmetry
      })
      .catch(err => {
        console.warn('API fetch failed, falling back to local categories:', err);
        renderCatsGrid(fallbackCats.slice(0, 6)); // Display 6 for 3-column symmetry
      });
  });
}