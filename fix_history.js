const fs = require('fs');

const adminCode = fs.readFileSync('frontend/src/pages/AdminConsultations.jsx', 'utf8');
if (!adminCode.includes('export default AdminConsultations')) {
  fs.writeFileSync('frontend/src/pages/AdminConsultations.jsx', adminCode + '\nexport default AdminConsultations;\n');
}

const docCode = fs.readFileSync('frontend/src/pages/DoctorCallHistory.jsx', 'utf8');
if (!docCode.includes('export default DoctorCallHistory')) {
  fs.writeFileSync('frontend/src/pages/DoctorCallHistory.jsx', docCode + '\nexport default DoctorCallHistory;\n');
}

const patCode = fs.readFileSync('frontend/src/pages/CallHistory.jsx', 'utf8');
if (!patCode.includes('export default CallHistory')) {
  const rest = `                    <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>Doctor: {c.doctorName || "Unknown"}</h3>
                    <span style={{ 
                      fontSize: "12px", 
                      padding: "4px 8px", 
                      borderRadius: "8px",
                      background: c.status === "Accepted" ? "#dcfce7" : c.status === "Rejected" ? "#fee2e2" : "#f1f5f9",
                      color: c.status === "Accepted" ? "#166534" : c.status === "Rejected" ? "#991b1b" : "#475569",
                      fontWeight: "bold"
                     }}>
                      {c.status}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Date: {new Date(c.date).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallHistory;
`;
  fs.writeFileSync('frontend/src/pages/CallHistory.jsx', patCode + rest);
}
console.log("FIXED");
