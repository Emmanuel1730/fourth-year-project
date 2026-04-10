import React, { useEffect, useState } from "react";
import api from "../../api/api";

const Schools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // 🔥 FETCH FROM BACKEND
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await api.get("/school");
        setSchools(res.data);
      } catch (err) {
        console.error("Failed to fetch schools:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  // Extract filters
  const districts = ["All", ...new Set(schools.map((s) => s.district))];
  const types = ["All", ...new Set(schools.map((s) => s.type))];

  // Filter logic
  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.district?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDistrict =
      districtFilter === "All" || school.district === districtFilter;

    const matchesType =
      typeFilter === "All" || school.type === typeFilter;

    return matchesSearch && matchesDistrict && matchesType;
  });

  const handleView = (school) => {
    console.log("School:", school);
  };

  if (loading) {
    return (
      <div className="p-6 text-white">
        Loading schools...
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen font-sans bg-[#0d1117]">
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">

        <input
          type="text"
          placeholder="Search schools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[250px] px-4 py-2 rounded-lg bg-[#161b22] border border-[#21262d] text-white"
        />

        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-[#161b22] border border-[#21262d] text-white"
        >
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-[#161b22] border border-[#21262d] text-white"
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg bg-[#161b22]">
        <table className="min-w-full">
          <thead className="bg-[#1c2330] border-b border-[#21262d]">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-[#8b949e]">Name</th>
              <th className="px-6 py-3 text-left text-xs text-[#8b949e]">District</th>
              <th className="px-6 py-3 text-left text-xs text-[#8b949e]">Type</th>
              <th className="px-6 py-3 text-left text-xs text-[#8b949e]">Students</th>
              <th className="px-6 py-3 text-left text-xs text-[#8b949e]">Teachers</th>
              <th className="px-6 py-3 text-left text-xs text-[#8b949e]">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredSchools.map((school) => (
              <tr
                key={school.id}
                className="border-b border-[#21262d] hover:bg-[#1c2330]"
              >
                <td className="px-6 py-4 text-white">{school.name}</td>
                <td className="px-6 py-4 text-[#8b949e]">{school.district}</td>
                <td className="px-6 py-4 text-[#8b949e]">{school.type}</td>
                <td className="px-6 py-4 text-[#8b949e]">
                  {school.profiles?.length || 0}
                </td>
                <td className="px-6 py-4 text-[#8b949e]">
                  {/* you may later filter teachers specifically */}
                  {school.profiles?.length || 0}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleView(school)}
                    className="text-[#388bfd] hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSchools.length === 0 && (
          <div className="p-6 text-center text-[#6e7681]">
            No schools found
          </div>
        )}
      </div>
    </div>
  );
};

export default Schools;