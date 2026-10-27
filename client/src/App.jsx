
import { useEffect, useState } from "react";
import "./App.css";


const categoryImages = {
  "Web Development":
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",

  "AI/ML":
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",

  "Environment":
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",

  "Mobile App":
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",

  "IoT & Hardware":
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",

  "Cybersecurity":
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",

  "Other":
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
};


const starterProjects = [
  {
    id: 1,
    icon: "🎬",
    category: "Web Development",
    title: "CineSense",
    description:
      "Build a smarter movie recommendation platform using preferences and context.",
    skills: ["React", "JavaScript", "AI/ML"],
    members: 3,
    status: "Looking for members",
  },
  {
    id: 2,
    icon: "🌱",
    category: "Environment",
    title: "GreenTrack",
    description:
      "Create a dashboard that helps students track and reduce their carbon footprint.",
    skills: ["Python", "Data Science", "UI/UX"],
    members: 2,
    status: "Looking for members",
  },
  {
    id: 3,
    icon: "🔐",
    category: "IoT & Hardware",
    title: "SmartShield",
    description:
      "Develop an IoT security system that detects suspicious activity and sends alerts.",
    skills: ["ESP32", "IoT", "C++"],
    members: 4,
    status: "Looking for members",
  },
];

function App() {
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [serverStatus, setServerStatus] = useState("Connecting...");
  const [activePage, setActivePage] = useState("Home");
  
const [user, setUser] = useState(() => {
  try {
    return JSON.parse(sessionStorage.getItem("projectpulseUser")) || null;
  } catch {
    return null;
  }
});

const [authMode, setAuthMode] = useState("login");
const [authForm, setAuthForm] = useState({
  name: "",
  email: "",
  password: "",
});
const [authError, setAuthError] = useState("");
const [authLoading, setAuthLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "Web Development",
    description: "",
    skills: "",
  });

  useEffect(() => {
    fetch("http://localhost:5000")
      .then((response) => response.text())
      .then((data) => setServerStatus(data))
      .catch(() => setServerStatus("Backend unavailable"));
  }, []);



  useEffect(() => {
    fetch("http://localhost:5000/api/projects")
      .then((response) => {
        if (!response.ok) throw new Error("API unavailable");
        return response.json();
      })
      .then((data) => setProjects(data))
      .catch(() => setProjects(starterProjects));
  }, []);

  
useEffect(() => {
  if (activePage !== "My Applications") return;

  async function loadApplications() {
    setApplicationsLoading(true);

    try {
      const response = await fetch(
  "http://localhost:5000/api/applications",
  {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("projectpulseToken")}`,
    },
  }
);

      if (!response.ok) {
        throw new Error("Could not load applications");
      }

      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setApplicationsLoading(false);
    }
  }

  loadApplications();
}, [activePage]);


  const visibleProjects = projects.filter((project) => {
    const text =
      `${project.title} ${project.category} ${project.description} ${(project.skills || []).join(" ")}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  async function createProject(event) {
    event.preventDefault();

    const newProject = {
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
    };

    if (!newProject.title || !newProject.description) return;

    try {
      const response = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("projectpulseToken")}`,
      },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) throw new Error("Could not save project");

      const savedProject = await response.json();
      setProjects((previous) => [savedProject, ...previous]);
      setForm({
        title: "",
        category: "Web Development",
        description: "",
        skills: "",
      });
      setActivePage("Explore Projects");
      alert("Project created successfully!");
    } catch {
      alert("The project API is not ready yet. We'll connect it in the next step.");
    }
  }

  
async function requestToJoin(project) {
  const applicantName =
    prompt("Enter your name:") || "ProjectPulse User";

  const message =
    prompt("Why do you want to join this project?") || "";

  try {
    const response = await fetch("http://localhost:5000/api/applications", {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("projectpulseToken")}`,
      },
      body: JSON.stringify({
        projectId: project._id,
        projectTitle: project.title,
        applicantName,
        message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Application failed");
    }

        alert("Application submitted successfully!");
        setActivePage("My Applications");
  } catch (error) {
    console.error("Application error:", error);
    alert("Could not submit application. Please try again.");
  }
}

async function handleAuth(event) {
  event.preventDefault();
  setAuthError("");
  setAuthLoading(true);

  const endpoint =
    authMode === "signup" ? "signup" : "login";

  try {
    const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(authForm),
});

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Authentication failed.");
    }

    sessionStorage.setItem("projectpulseToken", data.token);
    sessionStorage.setItem(
      "projectpulseUser",
      JSON.stringify(data.user)
    );

    setUser(data.user);
    setActivePage("Home");
    setAuthForm({ name: "", email: "", password: "" });
  } catch (error) {
    setAuthError(
      error.message || "Could not connect to the server."
    );
  } finally {
    setAuthLoading(false);
  }
}

function logout() {
  sessionStorage.removeItem("projectpulseToken");
  sessionStorage.removeItem("projectpulseUser");
  setUser(null);
  setAuthMode("login");
  setAuthError("");
  setActivePage("Home");
}


  return (
    <>
    
{!user ? (
  <main className="page-container">
    <div className="project-card" style={{ maxWidth: 480, margin: "60px auto" }}>
      <div className="project-icon">✦</div>

      <h2>{authMode === "signup" ? "Create your account" : "Welcome back!"}</h2>

      <p>
        {authMode === "signup"
          ? "Join ProjectPulse and start building together."
          : "Log in to continue your journey."}
      </p>

      <form onSubmit={handleAuth}>
        {authMode === "signup" && (
          <label>
            Full name
            <input
              required
              value={authForm.name}
              onChange={(event) =>
                setAuthForm({ ...authForm, name: event.target.value })
              }
              placeholder="Enter your name"
              style={inputStyle}
            />
          </label>
        )}

        <label>
          Email
          <input
            required
            type="email"
            value={authForm.email}
            onChange={(event) =>
              setAuthForm({ ...authForm, email: event.target.value })
            }
            placeholder="you@example.com"
            style={inputStyle}
          />
        </label>

        <label>
          Password
          <input
            required
            type="password"
            minLength={authMode === "signup" ? 8 : undefined}
            value={authForm.password}
            onChange={(event) =>
              setAuthForm({ ...authForm, password: event.target.value })
            }
            placeholder={authMode === "signup" ? "At least 8 characters" : "Enter your password"}
            style={inputStyle}
          />
        </label>

        {authError && (
          <p style={{ color: "#c62828" }}>{authError}</p>
        )}

        <button
          className="primary-btn"
          type="submit"
          disabled={authLoading}
        >
          {authLoading
            ? "Please wait..."
            : authMode === "signup"
              ? "Create account"
              : "Log in"}
        </button>
      </form>

      <p style={{ marginTop: 20 }}>
        {authMode === "signup"
          ? "Already have an account?"
          : "New to ProjectPulse?"}{" "}

        <button
          type="button"
          onClick={() => {
            setAuthMode(authMode === "signup" ? "login" : "signup");
            setAuthError("");
          }}
          style={{
            border: "none",
            background: "transparent",
            color: "#7255d9",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {authMode === "signup" ? "Log in" : "Sign up"}
        </button>
      </p>
    </div>
  </main>
) : (
  <>
    <nav className="navbar">
        <div className="logo">✦ ProjectPulse</div>

        <div className="nav-links">
          
        {["Home", "About", "Dashboard", "Explore Projects", "Create Project", "My Applications", "My Profile", "Contact Us"].map((page) => (

              <a
                href="#"
                key={page}
                className={activePage === page ? "active" : ""}
                onClick={(event) => {
                  event.preventDefault();
                  setActivePage(page);
                }}
              >
                {page}
              </a>
            )
          )}
        </div>
      </nav>
  </>
)}

      

      {activePage === "Home" && (
        <>
          <section className="hero">
            <div className="hero-content">
              <span className="eyebrow">✦ YOUR NEXT BIG IDEA STARTS HERE</span>
              <h1>
                Great things happen
                <br />
                when <span>students build together.</span>
              </h1>
              <p>
                Discover exciting projects, find teammates who share your
                passion, and turn your ideas into something real.
              </p>

              <div className="search-bar">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search projects, skills, or technologies..."
                />
                <button
                  className="primary-btn"
                  onClick={() => setActivePage("Explore Projects")}
                >
                  Explore projects →
                </button>
              </div>
            </div>
          </section>

          <main className="page-container">
            <div className="stats">
              <div className="stat-card">
                <strong>{projects.length}+</strong>
                <span>Project ideas to explore</span>
              </div>
              <div className="stat-card">
                <strong>Build</strong>
                <span>Real-world experience</span>
              </div>
              <div className="stat-card">
                <strong>Together</strong>
                <span>Find your future teammates</span>
              </div>
            </div>

            <ProjectSection
              projects={visibleProjects.slice(0, 3)}
              onJoin={requestToJoin}
              onExplore={() => setActivePage("Explore Projects")}
            />
          </main>
        </>
      )}

      
{activePage === "About" && (
  <main className="page-container about-page">
    <section className="about-hero">
      <span className="about-eyebrow">
        ✦ MORE THAN JUST PROJECTS
      </span>

      <h1>
        Ideas don't build themselves.
        <br />
        <span>Great teams do.</span>
      </h1>

      <p>
        ProjectPulse brings students together to discover ideas,
        find teammates, and turn imagination into real-world projects.
      </p>

      <button
        className="primary-btn"
        onClick={() => setActivePage("Explore Projects")}
      >
        Explore Projects →
      </button>
    </section>

    <section className="about-mission">
      <span className="about-eyebrow">OUR MISSION</span>
      <h2>From a simple idea to something extraordinary.</h2>
      <p>
        We believe every student has the potential to create something
        meaningful. ProjectPulse makes collaboration easier by connecting
        people, skills, and opportunities in one place.
      </p>
    </section>

    <section className="about-grid">
      <article className="about-card">
        <div className="about-icon blue">✦</div>
        <h3>Discover Ideas</h3>
        <p>
          Explore projects across technology, AI, environment,
          hardware, and more.
        </p>
      </article>

      <article className="about-card">
        <div className="about-icon red">♡</div>
        <h3>Find Your Team</h3>
        <p>
          Connect with students who share your interests and
          bring different skills to the table.
        </p>
      </article>

      <article className="about-card">
        <div className="about-icon blue">⌘</div>
        <h3>Build Together</h3>
        <p>
          Turn concepts into practical projects through
          teamwork, creativity, and experimentation.
        </p>
      </article>
    </section>

    <section className="about-bottom">
      <span className="about-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
      <h2>Your idea. Your team. <span>Your impact.</span></h2>
      <button
        className="primary-btn"
        onClick={() => setActivePage("Create Project")}
      >
        Start Building →
      </button>
    </section>
  </main>
)}


      {activePage === "Explore Projects" && (
        <main className="page-container">
          <div className="section-heading">
            <div>
              <h2>Explore projects</h2>
              <p>Find an idea that matches your interests and skills.</p>
            </div>
          </div>

          <div className="search-bar" style={{ marginBottom: 28 }}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, category, or skill..."
            />
          </div>

          <ProjectSection projects={visibleProjects} onJoin={requestToJoin} />
        </main>
      )}

      {activePage === "Create Project" && (
        <main className="page-container">
          <div className="section-heading">
            <div>
              <h2>Create a project</h2>
              <p>Share your idea and find people to build it with you.</p>
            </div>
          </div>

          <form
            className="project-card"
            style={{ maxWidth: 650 }}
            onSubmit={createProject}
          >
            <label>
              Project title
              <input
                required
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                placeholder="e.g. CampusConnect"
                style={inputStyle}
              />
            </label>

            <label>
              Category
              
<select
  value={form.category}
  onChange={(event) =>
    setForm({ ...form, category: event.target.value })
  }
  style={inputStyle}
>
  <option>Web Development</option>
  <option>AI/ML</option>
  <option>Environment</option>
  <option>Mobile App</option>
  <option>IoT & Hardware</option>
  <option>Cybersecurity</option>
  <option>Other</option>
</select>

            </label>

            <label>
              Description
              <textarea
                required
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                placeholder="What problem does your project solve?"
                rows={4}
                style={inputStyle}
              />
            </label>

            <label>
              Skills needed (comma separated)
              <input
                value={form.skills}
                onChange={(event) =>
                  setForm({ ...form, skills: event.target.value })
                }
                placeholder="React, Python, UI/UX"
                style={inputStyle}
              />
            </label>

            <button className="primary-btn" type="submit">
              Create project
            </button>
          </form>
        </main>
      )}

      
{activePage === "My Applications" && (
  <main className="page-container">
    <h2>My Applications</h2>
    <p>Track your requests to join projects.</p>

    {applicationsLoading ? (
      <p>Loading your applications...</p>
    ) : applications.length === 0 ? (
      <div className="project-card">
        <div className="project-icon">📬</div>
        <h3>No applications yet</h3>
        <p>Explore projects and send a request to join a team.</p>
        <button
          className="primary-btn"
          onClick={() => setActivePage("Explore Projects")}
        >
          Find projects
        </button>
      </div>
    ) : (
      <div className="project-grid">
        {applications.map((application) => (
          <div className="project-card" key={application._id}>
            <div className="project-icon">📬</div>

            <h3>{application.projectTitle}</h3>

            <p>
              <strong>Applicant:</strong>{" "}
              {application.applicantName}
            </p>

            <p>
              <strong>Message:</strong>{" "}
              {application.message || "No message provided"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span>{application.status}</span>
            </p>

            <p>
              <strong>Submitted:</strong>{" "}
              {new Date(application.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    )}
  </main>
)}


{activePage === "Dashboard" && (
  <main className="page-container">
    <div className="section-heading">
      <div>
        <h2>My Dashboard</h2>
        <p>Track your projects, applications, and team activity.</p>
      </div>
    </div>

    <div className="stats">
      <div className="stat-card">
        <strong>{projects.length}</strong>
        <span>Projects available</span>
      </div>

      <div className="stat-card">
        <strong>
          {
            applications.filter(
              (app) =>
                String(app.status || "").toLowerCase() === "pending"
            ).length
          }
        </strong>
        <span>Pending applications</span>
      </div>

      <div className="stat-card">
        <strong>
          {
            applications.filter(
              (app) =>
                String(app.status || "").toLowerCase() === "accepted"
            ).length
          }
        </strong>
        <span>Accepted applications</span>
      </div>

      <div className="stat-card">
        <strong>
          {
            applications.filter(
              (app) =>
                String(app.status || "").toLowerCase() === "rejected"
            ).length
          }
        </strong>
        <span>Rejected applications</span>
      </div>
    </div>

    <div className="section-heading">
      <div>
        <h2>Recent Applications</h2>
        <p>Check the latest application statuses.</p>
      </div>

      <button
        className="primary-btn"
        onClick={() => setActivePage("My Applications")}
      >
        View all →
      </button>
    </div>

    {applicationsLoading ? (
      <div className="project-card">
        <p>Loading applications...</p>
      </div>
    ) : applications.length === 0 ? (
      <div className="project-card">
        <div className="project-icon">📬</div>
        <h3>No applications to show</h3>
        <p>Explore projects and request to join a team.</p>
        <button
          className="primary-btn"
          onClick={() => setActivePage("Explore Projects")}
        >
          Explore Projects →
        </button>
      </div>
    ) : (
      <div className="project-grid">
        {applications.slice(0, 4).map((application) => (
          <div className="project-card" key={application._id}>
            <div className="project-icon">📋</div>

            <h3>{application.projectTitle}</h3>

            <p>
              <strong>Status:</strong>{" "}
              {String(application.status || "Pending").toUpperCase()}
            </p>

            <p>
              <strong>Applied:</strong>{" "}
              {application.createdAt
                ? new Date(application.createdAt).toLocaleDateString()
                : "Date unavailable"}
            </p>
          </div>
        ))}
      </div>
    )}

    <div className="section-heading" style={{ marginTop: 36 }}>
      <div>
        <h2>Quick Actions</h2>
        <p>Jump straight into your next task.</p>
      </div>
    </div>

    <div className="project-grid">
      <div className="project-card">
        <div className="project-icon">🚀</div>
        <h3>Explore Projects</h3>
        <p>Discover ideas and find projects that interest you.</p>
        <button
          className="primary-btn"
          onClick={() => setActivePage("Explore Projects")}
        >
          Explore →
        </button>
      </div>

      <div className="project-card">
        <div className="project-icon">✨</div>
        <h3>Create a Project</h3>
        <p>Share your idea and find teammates to build it.</p>
        <button
          className="primary-btn"
          onClick={() => setActivePage("Create Project")}
        >
          Create →
        </button>
      </div>

      <div className="project-card">
        <div className="project-icon">👤</div>
        <h3>My Profile</h3>
        <p>View your ProjectPulse account details.</p>
        <button
          className="primary-btn"
          onClick={() => setActivePage("My Profile")}
        >
          View Profile →
        </button>
      </div>
    </div>
  </main>
)}

      
{activePage === "My Profile" && (
  <main className="page-container">
    <div className="section-heading">
      <div>
        <h2>My Profile</h2>
        <p>Your ProjectPulse account details.</p>
      </div>
    </div>

    <div className="project-card" style={{ maxWidth: 550 }}>
      <div className="project-icon">👩‍💻</div>

      <h3>{user?.name || "Student"}</h3>

      

<p>
  <strong>Email:</strong> {user?.email || "Not available"}
</p>

<p>
  <strong>Account:</strong>{" "}
  <span className="status-badge status-accepted">
    ACTIVE
  </span>
</p>



      <div className="tags">
        <span className="tag">ProjectPulse Member</span>
        <span className="tag">Student</span>
      </div>

      <button
        className="primary-btn"
        onClick={logout}
        style={{ marginTop: 20 }}
      >
        Log out
      </button>
    </div>
  </main>
)}


{activePage === "Contact Us" && (
  <main className="page-container contact-page">
    <div className="section-heading">
      <div>
        <h2>Contact Us</h2>
        <p>Have a question or suggestion? We'd love to hear from you.</p>
      </div>
    </div>

    <div className="contact-card">
      <form
        
onSubmit={async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);

  const contactData = {
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  };

  try {
    const response = await fetch("http://localhost:5000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    });

    const responseText = await response.text();
    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Server returned an unexpected response (HTTP ${response.status}). Check the backend server.`
      );
    }

    if (!response.ok) {
      throw new Error(data.message || "Could not send your message.");
    }

    alert(data.message || "Your message was saved successfully!");
    form.reset();
  } catch (error) {
    console.error("Contact form error:", error);
    alert(`Contact form error: ${error.message}`);
  }
}}

      >
        <label>
          Your name
          <input
            name="name"
            type="text"
            placeholder="Enter your name"
            required
            style={inputStyle}
          />
        </label>

        <label>
          Email address
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            style={inputStyle}
          />
        </label>

        <label>
          Subject
          <select name="subject" required style={inputStyle} defaultValue="">
            <option value="" disabled>Select a subject</option>
            <option>General question</option>
            <option>Technical support</option>
            <option>Feedback or suggestion</option>
            <option>Collaboration</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Your message
          <textarea
            name="message"
            placeholder="Write your message here..."
            rows={5}
            required
            style={inputStyle}
          />
        </label>

        <button className="primary-btn" type="submit">
          Send Message →
        </button>
      </form>
    </div>
  </main>
)}



      <footer className="footer">
        ProjectPulse · Find your people. Build your idea. Make an impact.
        <br />
        <span style={{ display: "inline-block", marginTop: 8 }}>
          Backend: {serverStatus}
        </span>
      </footer>
    </>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: 12,
  marginTop: 8,
  marginBottom: 18,
  border: "1px solid #e1e3ee",
  borderRadius: 9,
  background: "#fff",
};

function ProjectSection({ projects, onJoin, onExplore }) {
  return (
    <section>
      <div className="section-heading">
        <div>
          <h2>Projects worth building</h2>
          <p>Ideas today. Real-world solutions tomorrow.</p>
        </div>
        {onExplore && (
          <button className="primary-btn" onClick={onExplore}>
            View all →
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <p>No projects match your search. Try a different keyword.</p>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project._id || project.id || project.title}>
              
<img
  className="project-image"
  src={
    categoryImages[project.category] ||
    categoryImages["Other"]
  }
  alt={`${project.category || "Other"} project`}
  onError={(event) => {
    event.currentTarget.style.display = "none";
  }}
/>

              <span className="tag">{project.category}</span>
              <h3 style={{ marginTop: 16 }}>{project.title}</h3>
              <p>{project.description}</p>

              <div className="tags">
                {(project.skills || []).map((skill) => (
                  <span className="tag" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>

              <div className="card-footer">
                <span>{project.status || "Open to collaborators"}</span>
                <button onClick={() => onJoin(project)}>Request to join →</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default App;
