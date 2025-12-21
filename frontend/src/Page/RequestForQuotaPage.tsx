import React, { useEffect, useState, useRef } from "react";
import Footer from "../components/footer";
import { productService } from "../services/productService";
import type { Product } from "../types/product";
import { rfqService } from "../services/rfqService";
import { cartService } from "../services/cartService";
import {
  FaMicrochip,
  FaMemory,
  FaHdd,
  FaSnowflake,
  FaBox,
  FaBolt,
  FaDesktop,
  FaCogs,
} from "react-icons/fa";

const componentCategories = [
  {
    key: "cpu",
    label: "CPU",
    category: "CPU",
    icon: <FaMicrochip color="#e53935" size={28} />,
  },
  {
    key: "motherboard",
    label: "Motherboard",
    category: "Motherboard",
    icon: <FaCogs color="#e53935" size={28} />,
  },
  {
    key: "ram",
    label: "RAM",
    category: "RAM",
    icon: <FaMemory color="#e53935" size={28} />,
  },
  {
    key: "gpu",
    label: "GPU",
    category: "GPU",
    icon: <FaDesktop color="#e53935" size={28} />,
  },
  {
    key: "psu",
    label: "PSU",
    category: "PSU",
    icon: <FaBolt color="#e53935" size={28} />,
  },
  {
    key: "drive",
    label: "Drive",
    category: "Drive",
    icon: <FaHdd color="#e53935" size={28} />,
  },
  {
    key: "cooler",
    label: "Cooler",
    category: "Cooler",
    icon: <FaSnowflake color="#e53935" size={28} />,
  },
  {
    key: "case",
    label: "Case",
    category: "Case",
    icon: <FaBox color="#e53935" size={28} />,
  },
];

const CustomDropdown: React.FC<{
  label: string;
  options: Product[];
  value: string;
  onChange: (value: string) => void;
  loading: boolean;
}> = ({ label, options, value, onChange, loading }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to get display name
  const getDisplayName = (p: Product) => {
    if (p.model) return p.brand ? `${p.brand} ${p.model}` : p.model;
    if (p.name) return p.name;
    if (p.brand) return p.brand;
    return "-";
  };

  // Search by model, brand, or name
  const filtered = options.filter((p) => {
    const display = getDisplayName(p).toLowerCase();
    return !search || display.includes(search.toLowerCase());
  });
  const selectedOption = options.find((p) => p.id === value);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <div
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: 12,
          border: "1px solid #eee",
          fontSize: 16,
          background: "#fafbfc",
          cursor: "pointer",
          minHeight: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: 500,
        }}
        onClick={() => setOpen((v) => !v)}
        tabIndex={0}
      >
        <span style={{ color: selectedOption ? "#222" : "#888" }}>
          {selectedOption ? getDisplayName(selectedOption) : `Select ${label}`}
        </span>
        <span style={{ marginLeft: 12, color: "#888", fontSize: 20 }}>
          &#9662;
        </span>
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            top: 52,
            left: 0,
            width: "100%",
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 12,
            zIndex: 10,
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            maxHeight: 260,
            overflowY: "auto",
          }}
        >
          <input
            type="text"
            placeholder={`Search ${label}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              border: "none",
              borderBottom: "1px solid #eee",
              outline: "none",
              fontSize: 15,
              borderRadius: "12px 12px 0 0",
              background: "#fafbfc",
            }}
            autoFocus
          />
          <div
            style={{
              padding: 12,
              cursor: "pointer",
              color: "#e53935",
              fontWeight: 600,
              borderBottom: "1px solid #eee",
              background: value === "" ? "#f5f5f5" : "#fff",
            }}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            Unselect
          </div>
          {loading ? (
            <div style={{ padding: 16, color: "#888" }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 16, color: "#888" }}>No options</div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: 12,
                  cursor: "pointer",
                  background: value === p.id ? "#f5f5f5" : "#fff",
                  fontWeight: value === p.id ? 600 : 400,
                }}
                onClick={() => {
                  onChange(p.id);
                  setOpen(false);
                }}
              >
                {getDisplayName(p)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const RequestForQuotaPage: React.FC = () => {
  const [amount, setAmount] = useState("");
  const [options, setOptions] = useState<Record<string, Product[]>>({});
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showComponents, setShowComponents] = useState(true);
  const [builds, setBuilds] = useState<any[]>([]);
  const [buildsLoading, setBuildsLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const take = 10;
  const [totalCount, setTotalCount] = useState(0);
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");
  // Add state for price reduction checkboxes
  const [reduce, setReduce] = useState<Record<string, boolean>>({});
  const [addCartLoading, setAddCartLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [addCartMsg, setAddCartMsg] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogBuildIdx, setDialogBuildIdx] = useState<number | null>(null);
  const [dialogBuild, setDialogBuild] = useState<any>(null);
  const [prebuilt, setPrebuilt] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all(
      componentCategories.map(async ({ key, category }) => {
        const products = await productService.getProductsByCategoryName(
          category
        );
        return { key, products };
      })
    ).then((results) => {
      const opts: Record<string, Product[]> = {};
      results.forEach(({ key, products }) => {
        opts[key] = products;
      });
      setOptions(opts);
      setLoading(false);
    });
  }, []);

  const handleSelect = (key: string, value: string) => {
    setSelected((prev) => ({ ...prev, [key]: value }));
  };

  // Handler for checkbox
  const handleReduceChange = (key: string, checked: boolean) => {
    setReduce((prev) => ({ ...prev, [key]: checked }));
  };

  // Build the filter object for the API
  const buildFilter = {
    amount: amount ? Number(amount) : 0,
    cpuId: selected.cpu || undefined,
    motherboardId: selected.motherboard || undefined,
    ramId: selected.ram || undefined,
    gpuId: selected.gpu || undefined,
    psuId: selected.psu || undefined,
    driveId: selected.drive || undefined,
    coolerId: selected.cooler || undefined,
    caseId: selected.case || undefined,
    order,
    skip,
    take,
  };

  // Fetch builds when filter or paging changes
  useEffect(() => {
    if (!amount) return;
    setBuildsLoading(true);
    rfqService.getBuilds(buildFilter).then((result) => {
      setBuilds(result.builds);
      setTotalCount(result.count);
      setBuildsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, skip, order, ...componentCategories.map((c) => selected[c.key])]);

  // Paging controls
  const handlePrev = () => setSkip((prev) => Math.max(0, prev - take));
  const handleNext = () => setSkip((prev) => prev + take);
  const currentPage = Math.floor(skip / take) + 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / take));
  const isLastPage = skip + take >= totalCount;
  const [pageInput, setPageInput] = useState(currentPage.toString());

  // Sync pageInput with currentPage
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setPageInput(val);
  };
  const handlePageInputBlur = () => {
    let page = parseInt(pageInput, 10);
    if (isNaN(page) || page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setSkip((page - 1) * take);
  };
  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  // Modified Add to Cart handler to use dialog
  const handleAddToCart = async (
    build: any,
    idx: number,
    prebuilt: boolean
  ) => {
    setAddCartLoading((prev) => ({ ...prev, [build.id || idx]: true }));
    setAddCartMsg((prev) => ({ ...prev, [build.id || idx]: "" }));
    try {
      // For each component not reduced, add to cart
      const addPromises = componentCategories
        .filter(
          ({ key }) => !reduce[key] && build[key] && build[key].product?.id
        )
        .map(({ key }) => cartService.addToCart(build[key].product.id, 1));
      // If prebuilt, add the 'build' product as well
      if (prebuilt) {
        const buildProduct = await productService.getProductByName("Build");
        console.log(buildProduct);
        if (!buildProduct || !buildProduct.id) {
          throw new Error("Prebuilt product ('Build') not found");
        }
        addPromises.push(cartService.addToCart(buildProduct.id, 1));
      }
      await Promise.all(addPromises);
      let msg = "Added to cart!";
      if (prebuilt) {
        msg += " (+200,000 VND for prebuilt, added to invoice)";
      }
      setAddCartMsg((prev) => ({ ...prev, [build.id || idx]: msg }));
    } catch (err: any) {
      setAddCartMsg((prev) => ({
        ...prev,
        [build.id || idx]: err?.message || "Failed to add to cart",
      }));
    } finally {
      setAddCartLoading((prev) => ({ ...prev, [build.id || idx]: false }));
    }
  };

  // Handler for build button click
  const handleBuildButtonClick = (build: any, idx: number) => {
    setDialogBuild(build);
    setDialogBuildIdx(idx);
    setPrebuilt(false);
    setDialogOpen(true);
  };

  // Handler for dialog confirm
  const handleDialogConfirm = () => {
    if (dialogBuild && dialogBuildIdx !== null) {
      handleAddToCart(dialogBuild, dialogBuildIdx, prebuilt);
    }
    setDialogOpen(false);
  };

  // Handler for dialog cancel
  const handleDialogCancel = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 40,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 700,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontWeight: 800, fontSize: 40, marginBottom: 8 }}>
            Build Your PC
          </h1>
          <div style={{ fontSize: 20, color: "#444", marginBottom: 32 }}>
            Select components to build your perfect setup
          </div>
          <div style={{ maxWidth: 400, margin: "0 auto", marginBottom: 24 }}>
            <div
              style={{ textAlign: "left", fontWeight: 600, marginBottom: 6 }}
            >
              Amount (VND)
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter your budget"
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 8,
                border: "1.5px solid #e0e0e0",
                fontSize: 18,
                marginBottom: 18,
                background: "#fafbfc",
              }}
            />
          </div>
          <button
            style={{
              background: "#e53935",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "14px 36px",
              fontWeight: 700,
              fontSize: 20,
              margin: "24px 0",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(229,57,53,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginLeft: "auto",
              marginRight: "auto",
              transition: "background 0.2s",
            }}
            onClick={() => setShowComponents((v) => !v)}
          >
            <FaCogs size={22} style={{ marginRight: 6 }} />
            {showComponents ? "Hide Components" : "Select Components"}
            <span style={{ fontSize: 18, marginLeft: 8 }}>
              {showComponents ? "▲" : "▼"}
            </span>
          </button>
        </div>
        {showComponents && (
          <div
            style={{
              width: "100%",
              maxWidth: 900,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 32,
              marginTop: 0,
            }}
          >
            {componentCategories.map(({ key, label, icon }) => (
              <div
                key={key}
                style={{
                  background: "#fafbfc",
                  borderRadius: 16,
                  padding: "24px 24px 18px 24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  minHeight: 120,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 10,
                    gap: 12,
                  }}
                >
                  {icon}
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 18,
                      color: "#e53935",
                      letterSpacing: 0.5,
                    }}
                  >
                    {label}
                  </div>
                  <label
                    style={{
                      marginLeft: 16,
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 500,
                      fontSize: 15,
                      color: "#444",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!reduce[key]}
                      onChange={(e) =>
                        handleReduceChange(key, e.target.checked)
                      }
                      style={{ marginRight: 6 }}
                    />
                    Reduce price
                  </label>
                </div>
                <CustomDropdown
                  label={label}
                  options={options[key] || []}
                  value={selected[key] || ""}
                  onChange={(v) => handleSelect(key, v)}
                  loading={loading}
                />
              </div>
            ))}
          </div>
        )}
        {/* Builds result section */}
        <div
          style={{ width: "100%", maxWidth: 900, margin: "40px auto 0 auto" }}
        >
          {buildsLoading ? (
            <div
              style={{
                textAlign: "center",
                color: "#e53935",
                fontWeight: 600,
                fontSize: 20,
                margin: "32px 0",
              }}
            >
              Loading builds...
            </div>
          ) : builds && builds.length > 0 ? (
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 24, marginBottom: 18 }}>
                Matching Builds
              </h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 16, color: "#444" }}>
                  Total Builds: <b>{totalCount}</b>
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 500 }}>
                    Order by price:
                  </span>
                  <select
                    value={order}
                    onChange={(e) => setOrder(e.target.value as "ASC" | "DESC")}
                    style={{
                      fontSize: 15,
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      padding: "4px 10px",
                    }}
                  >
                    <option value="ASC">Ascending</option>
                    <option value="DESC">Descending</option>
                  </select>
                </div>
              </div>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {builds.map((build, idx) => {
                  // Calculate reduction
                  let reduction = 0;
                  componentCategories.forEach(({ key }) => {
                    if (
                      reduce[key] &&
                      build[key] &&
                      typeof build[key].product?.price === "number"
                    ) {
                      reduction += build[key].product.price;
                    }
                  });
                  const reducedPrice = build.amount - reduction;
                  return (
                    <li
                      key={build.id || idx}
                      style={{
                        background: "#fff",
                        borderRadius: 10,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        marginBottom: 18,
                        padding: 18,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 18,
                          marginBottom: 8,
                        }}
                      >
                        Build #{skip + idx + 1} -{" "}
                        {reduction > 0 ? (
                          <>
                            <span
                              style={{
                                textDecoration: "line-through",
                                color: "#888",
                                marginRight: 8,
                              }}
                            >
                              {build.amount?.toLocaleString("vi-VN")} VND
                            </span>
                            <span style={{ color: "#e53935", fontWeight: 700 }}>
                              {reducedPrice.toLocaleString("vi-VN")} VND
                            </span>
                          </>
                        ) : (
                          <span>
                            {build.amount?.toLocaleString("vi-VN")} VND
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 18,
                          fontSize: 15,
                        }}
                      >
                        {componentCategories.map(({ key, label }) => {
                          // Prefer model (with brand if available), then name, then brand, then '-'
                          let compName = "-";
                          if (build[key]) {
                            if (build[key].model) {
                              compName = build[key].brand
                                ? `${build[key].brand} ${build[key].model}`
                                : build[key].model;
                            } else if (build[key].name) {
                              compName = build[key].name;
                            } else if (build[key].brand) {
                              compName = build[key].brand;
                            }
                          }
                          return build[key] ? (
                            <div key={key} style={{ minWidth: 120 }}>
                              <span
                                style={{ fontWeight: 500, color: "#e53935" }}
                              >
                                {label}:
                              </span>{" "}
                              {compName}
                              {reduce[key] &&
                              build[key] &&
                              typeof build[key].product?.price === "number" ? (
                                <span
                                  style={{
                                    color: "#388e3c",
                                    fontWeight: 600,
                                    marginLeft: 6,
                                  }}
                                >
                                  -
                                  {build[key].product.price.toLocaleString(
                                    "vi-VN"
                                  )}{" "}
                                  VND
                                </span>
                              ) : null}
                            </div>
                          ) : null;
                        })}
                      </div>
                      <div
                        style={{
                          marginTop: 16,
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <button
                          onClick={() => handleBuildButtonClick(build, idx)}
                          disabled={addCartLoading[build.id || idx]}
                          style={{
                            background: "#e53935",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "8px 18px",
                            fontWeight: 600,
                            fontSize: 16,
                            cursor: addCartLoading[build.id || idx]
                              ? "not-allowed"
                              : "pointer",
                            opacity: addCartLoading[build.id || idx] ? 0.7 : 1,
                          }}
                        >
                          {addCartLoading[build.id || idx]
                            ? "Adding..."
                            : "Add to Cart"}
                        </button>
                        {addCartMsg[build.id || idx] && (
                          <span
                            style={{
                              color: addCartMsg[build.id || idx].startsWith(
                                "Added to cart!"
                              )
                                ? "#388e3c"
                                : "#e53935",
                              fontWeight: 500,
                            }}
                          >
                            {addCartMsg[build.id || idx]}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 24,
                  marginTop: 24,
                }}
              >
                <button
                  onClick={handlePrev}
                  disabled={skip === 0}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 6,
                    border: "none",
                    background: skip === 0 ? "#eee" : "#e53935",
                    color: skip === 0 ? "#aaa" : "#fff",
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: skip === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  Prev
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  Page
                  <input
                    type="text"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onBlur={handlePageInputBlur}
                    onKeyDown={handlePageInputKeyDown}
                    style={{
                      width: 40,
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: 16,
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      margin: "0 6px",
                    }}
                  />
                  of {totalPages}
                </div>
                <button
                  onClick={handleNext}
                  disabled={isLastPage}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 6,
                    border: "none",
                    background: isLastPage ? "#eee" : "#e53935",
                    color: isLastPage ? "#aaa" : "#fff",
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: isLastPage ? "not-allowed" : "pointer",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "#888",
                fontWeight: 500,
                fontSize: 18,
                margin: "32px 0",
              }}
            >
              No builds found for the selected configuration.
            </div>
          )}
        </div>
      </div>
      {/* Dialog for prebuilt option */}
      {dialogOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.25)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              minWidth: 320,
              boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 20,
                marginBottom: 18,
                color: "#e53935",
              }}
            >
              Do you want this build to be prebuilt?
            </div>
            <div style={{ fontSize: 16, marginBottom: 18 }}>
              If yes, 200,000 VND will be added to your invoice for assembly
              service.
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 16,
                marginBottom: 18,
              }}
            >
              <input
                type="checkbox"
                checked={prebuilt}
                onChange={(e) => setPrebuilt(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Yes, I want it prebuilt (+200,000 VND)
            </label>
            <div
              style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}
            >
              <button
                onClick={handleDialogCancel}
                style={{
                  padding: "8px 18px",
                  borderRadius: 6,
                  border: "none",
                  background: "#eee",
                  color: "#444",
                  fontWeight: 600,
                  fontSize: 16,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDialogConfirm}
                style={{
                  padding: "8px 18px",
                  borderRadius: 6,
                  border: "none",
                  background: "#e53935",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 16,
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default RequestForQuotaPage;
